import json
import httpx
import pytest
from fastapi.testclient import TestClient
from backend.config import Config
from backend.main import create_app
from backend.services.llm import LLMService
from tests.test_backend import payload


def questions(client, record, request_id='questions-1', consent=True):
    return client.post(f'/api/challenges/{record["id"]}/questions', json={
        'request_id': request_id, 'expected_revision': record['revision'], 'consent': consent})


def test_stub_full_workflow_and_restart(tmp_path):
    config = Config(data_dir=tmp_path, mode='mock')
    with TestClient(create_app(config)) as client:
        original = client.post('/api/challenges', json=payload()).json()
        assert questions(client, original, consent=False).status_code == 403
        response = questions(client, original); assert response.status_code == 200
        questioned = response.json()
        assert questioned['questions']['origin']['mode'] == 'mock'
        assert questions(client, original).json() == questioned
        body = {'request_id': 'answers-1', 'expected_revision': questioned['revision'],
                'answers': [{'question_id': 'q1', 'state': 'answered', 'text': '前提是试验的可能结果已定义完整。'}]}
        answered = client.post(f'/api/challenges/{original["id"]}/answers', json=body).json()
        assert answered['stage'] == 'answered'
        assert client.post(f'/api/challenges/{original["id"]}/answers', json=body).json() == answered
        revision = {'request_id': 'revision-1', 'expected_revision': answered['revision'], 'text': '我需要先说明试验和观测粒度，再列举可能结果。'}
        revised = client.post(f'/api/challenges/{original["id"]}/revisions', json=revision).json()
        assert revised['explanation'] == original['explanation']
        assert revised['revisions'][0]['text'] == revision['text']
    with TestClient(create_app(config)) as restarted:
        assert restarted.get('/api/challenges/' + original['id']).json() == revised


def test_missing_key_never_falls_back(tmp_path):
    config = Config(data_dir=tmp_path, api_key='', model='', mode='live')
    with TestClient(create_app(config)) as client:
        record = client.post('/api/challenges', json=payload()).json()
        r = questions(client, record)
        assert r.status_code == 503 and r.json()['error']['code'] == 'API_CONFIGURATION'
        assert client.get('/api/challenges/' + record['id']).json()['questions'] is None
        assert client.get('/api/examples').json()['items'][0]['mode'] == 'example'


def live_client(tmp_path, handler):
    config = Config(data_dir=tmp_path, api_key='secret-test-only', model='test-model', mode='live')
    service = LLMService(config, httpx.MockTransport(handler))
    return TestClient(create_app(config, service)), service


def envelope(content):
    return httpx.Response(200, json={'choices': [{'finish_reason': 'stop', 'message': {'content': content}}],
                                      'usage': {'prompt_tokens': 50, 'completion_tokens': 30}})


def valid_output():
    return json.dumps({'questions': [{'question_id': 'q1', 'question': '如何决定基本结果的观测粒度？',
                                     'why_asked': '区分样本空间与事件。', 'based_on': '所有可能的基本结果'}]}, ensure_ascii=False)


def test_http_adapter_payload_provenance_and_idempotency(tmp_path):
    requests = []
    def handler(request):
        requests.append(json.loads(request.content))
        assert request.headers['authorization'] == 'Bearer secret-test-only'
        assert requests[-1]['messages'][1]['content'].find(payload()['explanation']) >= 0
        return envelope(valid_output())
    test_client, service = live_client(tmp_path, handler)
    with test_client as client:
        record = client.post('/api/challenges', json=payload()).json()
        r = questions(client, record); assert r.status_code == 200
        assert r.json()['questions']['origin']['mode'] == 'live'  # transport is simulated, not a real paid call
        assert questions(client, record).json() == r.json()
        assert len(requests) == service.live_requests == 1
        assert 'secret-test-only' not in client.get('/api/challenges').text
    assert b'secret-test-only' not in (tmp_path / 'app.db').read_bytes()


@pytest.mark.parametrize('kind,code', [('timeout','TASK_TIMEOUT'),('network','NETWORK_ERROR'),('auth','API_CONFIGURATION'),
                                   ('rate','RATE_LIMITED'),('bad-json','INVALID_OUTPUT'),('bad-reference','INVALID_REFERENCE'),('extra','INVALID_OUTPUT')])
def test_model_failures_keep_input(tmp_path, kind, code):
    calls = []
    def handler(request):
        calls.append(1)
        if kind == 'timeout': raise httpx.ReadTimeout('test')
        if kind == 'network': raise httpx.ConnectError('test')
        if kind == 'auth': return httpx.Response(401, text='secret-test-only')
        if kind == 'rate': return httpx.Response(429)
        if kind == 'bad-json': return envelope('```json\n{}\n```')
        result = json.loads(valid_output())
        if kind == 'bad-reference': result['questions'][0]['based_on'] = '用户从没说过这句话'
        if kind == 'extra': result['verified'] = True
        return envelope(json.dumps(result, ensure_ascii=False))
    test_client, service = live_client(tmp_path, handler)
    with test_client as client:
        record = client.post('/api/challenges', json=payload()).json()
        r = questions(client, record)
        assert r.json()['error']['code'] == code
        assert 'secret-test-only' not in r.text
        saved = client.get('/api/challenges/' + record['id']).json()
        assert saved['explanation'] == record['explanation'] and saved['questions'] is None
        assert service.live_requests == len(calls) == 1


def test_immutable_answers_revision_conflict_and_delete(tmp_path):
    with TestClient(create_app(Config(data_dir=tmp_path, mode='mock'))) as client:
        record = client.post('/api/challenges', json=payload()).json()
        record = questions(client, record).json()
        base = {'request_id': 'answer-1', 'expected_revision': record['revision']}
        bad = {**base, 'answers': [{'question_id': 'other', 'state': 'skipped', 'text': None}]}
        assert client.post(f'/api/challenges/{record["id"]}/answers', json=bad).status_code == 400
        good = {**base, 'answers': [{'question_id': 'q1', 'state': 'skipped', 'text': None}]}
        assert client.post(f'/api/challenges/{record["id"]}/answers', json=good).status_code == 200
        assert client.post(f'/api/challenges/{record["id"]}/answers', json={**good, 'request_id': 'answer-new'}).status_code == 409
        assert client.delete('/api/challenges/' + record['id']).status_code == 204
        assert client.get('/api/challenges/' + record['id']).status_code == 404


def test_memory_key_settings_and_secret_validation(tmp_path):
    with TestClient(create_app(Config(data_dir=tmp_path, api_key='', model=''))) as client:
        settings = {'mode': 'live', 'endpoint': 'https://api.deepseek.com', 'model': 'deepseek-v4-pro', 'api_key': 'ephemeral-secret'}
        r = client.post('/api/settings/llm', json=settings)
        assert r.json()['configured'] is True and 'ephemeral-secret' not in r.text
        settings['endpoint'] = 'http://bad.test'
        assert client.post('/api/settings/llm', json=settings).status_code == 400
        assert 'ephemeral-secret' not in client.post('/api/settings/llm', json={**settings, 'unknown': 1}).text
        assert client.delete('/api/settings/llm').json()['configured'] is False
    with TestClient(create_app(Config(data_dir=tmp_path, api_key='', model=''))) as restarted:
        assert restarted.get('/api/settings/llm').json()['configured'] is False


def test_duplicate_json_keys_are_rejected(tmp_path):
    test_client, _ = live_client(tmp_path, lambda request: envelope('{"questions":[],"questions":[]}'))
    with test_client as client:
        record = client.post('/api/challenges', json=payload()).json()
        assert questions(client, record).json()['error']['code'] == 'INVALID_OUTPUT'
