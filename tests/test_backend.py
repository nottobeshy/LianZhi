import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from backend.config import Config, ROOT
from backend.main import create_app


@pytest.fixture
def client(tmp_path):
    with TestClient(create_app(Config(data_dir=tmp_path))) as c:
        yield c


def payload():
    topic = json.loads((ROOT / 'backend/data/topics.json').read_text(encoding='utf-8'))[0]
    return {'request_id': 'create-1', 'topic': topic, 'explanation': '样本空间包含这个随机试验所有可能的基本结果。'}


def test_health_static_and_schema(client):
    assert client.get('/api/health').json()['database'] == 'ready'
    assert client.get('/').status_code == 200
    assert client.get('/js/banks.js').status_code == 200
    assert client.get('/openapi.json').status_code == 200
    assert client.get('/api/not-found').status_code == 404


def test_create_idempotency_and_topic_snapshot(client):
    p = payload()
    first = client.post('/api/challenges', json=p).json()
    assert client.post('/api/challenges', json=p).json()['id'] == first['id']
    assert len(client.get('/api/challenges').json()['items']) == 1
    assert client.get('/api/challenges/' + first['id']).json()['explanation'] == p['explanation']
    p['explanation'] = '另一个解释'
    assert client.post('/api/challenges', json=p).status_code == 409


def test_restart_persistence(tmp_path):
    config = Config(data_dir=tmp_path)
    with TestClient(create_app(config)) as client:
        saved = client.post('/api/challenges', json=payload()).json()
    with TestClient(create_app(config)) as restarted:
        assert restarted.get('/api/challenges/' + saved['id']).json() == saved


@pytest.mark.parametrize('text', ['', ' ', '字' * 6001], ids=['empty','blank','over-limit'])
def test_invalid_input(client, text):
    p = payload(); p['explanation'] = text
    r = client.post('/api/challenges', json=p)
    assert r.status_code == 422
    assert set(r.json()['error']) == {'code', 'message'}


def test_origin_and_host(client):
    assert client.post('/api/challenges', json=payload(), headers={'Origin': 'https://evil.test'}).status_code == 403
    assert client.get('/api/health', headers={'Host': 'evil.test'}).status_code == 403
