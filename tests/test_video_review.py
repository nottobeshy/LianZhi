"""Review protocol/storage tests with explicit transport/ASR substitutes, never paid API."""
import copy
import hashlib
import json
import sqlite3
from uuid import uuid4

import httpx
import pytest
from fastapi.testclient import TestClient

from backend.config import Config
from backend.main import create_app
from backend.services.llm import LLMService
from tests.test_backend import payload
from tests.test_video import fake_result
from tests.test_workflow import envelope


def fixture_video(app, client, tmp_path, confirm=True):
    media = tmp_path/'unit-fixture.mp4'
    media.write_bytes(b'explicit repository fixture, not actual video')
    repo = app.state.videos.repository
    record = repo.create(str(uuid4()), 'fixture-'+str(uuid4()),
                         dict(name='fixture.mp4', size=media.stat().st_size, sha256=hashlib.sha256(media.read_bytes()).hexdigest()),
                         dict(duration=1, audio_codec='fixture'))
    repo.start(record['id'], dict(request_id='asr-'+record['id'], expected_revision=1))
    repo.finish(record['id'], 'asr-'+record['id'], result=fake_result(media))
    record = repo.get(record['id'])
    if confirm:
        record = client.post('/api/videos/'+record['id']+'/transcript', json=dict(
            request_id='confirm-'+record['id'], expected_revision=record['revision'], confirm=True,
            segments=[dict(segment_id='s1', text='人工确认：公平且独立的两次抛掷，至少一次正面概率为四分之三。')])).json()
    return record


def review_body(video, request_id='review-1'):
    return dict(request_id=request_id, expected_revision=video['revision'],
                transcript_version_id=video['confirmed_version_id'] or str(uuid4()), consent=True)


def output():
    return dict(revised_script='在硬币公平、两次抛掷独立的前提下，至少一次正面的概率是四分之三。',
                change_summary=[dict(category='knowledge',segment_ids=['s1'],reason='保留公平和独立两个前提。')],
                needs_verification=[])


def setup(tmp_path, handler=None, mode='live', key='fixture-secret'):
    config = Config(data_dir=tmp_path/'data', mode=mode, api_key=key, model='fixture-model')
    llm = LLMService(config, httpx.MockTransport(handler or (lambda request: envelope(json.dumps(output())))))
    app = create_app(config, llm)
    return app, TestClient(app), llm


def test_review_confirmed_snapshot_edit_stale_history_and_restart(tmp_path):
    requests = []
    def handler(request):
        requests.append(json.loads(request.content))
        sent = json.loads(requests[-1]['messages'][1]['content'])
        assert set(sent) == {'transcript_version_id', 'segments'}
        assert set(sent['segments'][0]) == {'segment_id', 'text'}
        assert sent['segments'][0]['text'].startswith('人工确认') if len(requests)==1 else sent['segments'][0]['text']=='新的人工确认稿'
        assert 'fixture-secret' not in request.content.decode()
        return envelope(json.dumps(output(), ensure_ascii=False))
    app, context, llm = setup(tmp_path, handler)
    with context as client:
        challenge = client.post('/api/challenges', json=payload()).json()
        video = fixture_video(app, client, tmp_path)
        original = copy.deepcopy(video)
        body = review_body(video)
        base = '/api/videos/'+video['id']
        result = client.post(base+'/review', json=body)
        assert result.status_code == 200
        review = result.json()
        assert review['state'] == 'succeeded' and review['stale'] is False
        assert review['original_script'] == video['versions'][0]['segments'][0]['text']
        assert review['ai_script'] == output()['revised_script']
        assert review['origin']['mode'] == 'live'  # MockTransport, not a real service call.
        assert review['prompt_version'] == 'video-script-review-v1'
        assert client.post(base+'/review', json=body).json() == review
        assert llm.live_requests == len(requests) == 1
        assert client.get(base).json() == original
        edit = dict(request_id='edit-review', expected_revision=1, text='用户最终修改稿')
        edited = client.post(base+'/reviews/'+review['id']+'/script', json=edit).json()
        assert edited['ai_script'] == review['ai_script'] and edited['user_script'] == edit['text']
        assert len(edited['edits']) == 1
        assert client.post(base+'/reviews/'+review['id']+'/script', json=edit).json() == edited
        assert client.post(base+'/reviews/'+review['id']+'/script', json={**edit, 'text':'冲突'}).status_code == 409
        assert client.post(base+'/reviews/'+review['id']+'/script', json={**edit, 'request_id':'new-stale'}).status_code == 409
        changed = client.post(base+'/transcript', json=dict(request_id='change-source', expected_revision=video['revision'],
                  confirm=True, segments=[dict(segment_id='s1', text='新的人工确认稿')])).json()
        assert len(changed['versions']) == 2
        old = client.get(base+'/reviews').json()['items'][0]
        assert old['stale'] and old['original_script'] == review['original_script']
        assert client.post(base+'/review', json=body).json()['stale']  # Replay never charges again.
        assert client.post(base+'/review', json=review_body(changed, 'review-2')).status_code == 200
        assert llm.live_requests == 2
        assert client.get('/api/challenges/'+challenge['id']).json() == challenge
        assert 'fixture-secret' not in client.get(base+'/reviews').text
    with TestClient(create_app(Config(data_dir=tmp_path/'data'))) as client:
        records = client.get(base+'/reviews').json()['items']
        assert len(records) == 2 and not records[0]['stale'] and records[1]['stale']
        assert records[1]['user_script'] == '用户最终修改稿'
        assert client.get(base).json()['raw_transcript'] == original['raw_transcript']
    assert b'fixture-secret' not in (tmp_path/'data/app.db').read_bytes()


@pytest.mark.parametrize('kind,code', [('timeout','TASK_TIMEOUT'),('network','NETWORK_ERROR'),('auth','API_CONFIGURATION'),
    ('bad-json','INVALID_OUTPUT'),('duplicate-json','INVALID_OUTPUT'),('truncated','INVALID_OUTPUT'),
    ('unknown-segment','INVALID_REFERENCE'),('timestamp','INVALID_OUTPUT'),('extra','INVALID_OUTPUT')])
def test_review_failures_are_saved_without_changing_source(tmp_path, kind, code):
    calls = []
    def handler(request):
        calls.append(1)
        if kind == 'timeout': raise httpx.ReadTimeout('fixture-secret')
        if kind == 'network': raise httpx.ConnectError('fixture-secret')
        if kind == 'auth': return httpx.Response(401, text='fixture-secret')
        if kind == 'bad-json': return envelope('not-json')
        if kind == 'duplicate-json': return envelope('{"revised_script":"a","revised_script":"b"}')
        if kind == 'truncated': return httpx.Response(200, json={'choices':[{'finish_reason':'length','message':{'content':'{}'}}]})
        data = output()
        if kind == 'unknown-segment': data['change_summary'][0]['segment_ids'] = ['made-up']
        if kind == 'timestamp': data['change_summary'][0]['start'] = 10
        if kind == 'extra': data['verified'] = True
        return envelope(json.dumps(data))
    app, context, llm = setup(tmp_path, handler)
    with context as client:
        video = fixture_video(app, client, tmp_path)
        base = '/api/videos/'+video['id']
        body = review_body(video)
        result = client.post(base+'/review', json=body)
        assert result.json()['error']['code'] == code
        assert 'fixture-secret' not in result.text
        failed = client.get(base+'/reviews').json()['items'][0]
        assert failed['state'] == 'failed' and failed['error']['code'] == code and failed['ai_script'] is None
        assert client.get(base).json() == video
        assert client.post(base+'/review', json=body).status_code == 409
        assert len(calls) == llm.live_requests == 1


def test_review_consent_confirmation_key_lock_and_budget(tmp_path):
    app, context, llm = setup(tmp_path, key='')
    with context as client:
        video = fixture_video(app, client, tmp_path, confirm=False)
        base = '/api/videos/'+video['id']
        body = review_body(video)
        assert client.post(base+'/review', json={**body,'consent':False}).status_code == 403
        assert client.post(base+'/review', json=body).json()['error']['code'] == 'TRANSCRIPT_NOT_CONFIRMED'
        assert client.get(base+'/reviews').json()['items'] == []
        video = client.post(base+'/transcript', json=dict(request_id='confirm-now', expected_revision=video['revision'],
                      confirm=True, segments=video['draft'])).json()
        body = review_body(video)
        llm.lock.acquire()
        try:
            assert client.post(base+'/review', json=body).json()['error']['code'] == 'BUSY'
        finally: llm.lock.release()
        assert client.post(base+'/review', json=body).json()['error']['code'] == 'API_CONFIGURATION'
        assert llm.live_requests == 0
        llm.config.api_key='fixture-secret'; llm.live_requests=llm.config.live_limit
        assert client.post(base+'/review', json={**body,'request_id':'budget'}).json()['error']['code'] == 'REQUEST_BUDGET'
        assert client.post(base+'/review', json={**body,'request_id':'bad-version','transcript_version_id':str(uuid4())}).status_code == 409


def test_model_result_becomes_stale_if_transcript_changes_during_request(tmp_path):
    state = {}
    def handler(request):
        video = state['video']
        state['app'].state.videos.repository.save(video['id'],dict(request_id='during-call',
            expected_revision=video['revision'],confirm=False,segments=[dict(segment_id='s1',text='已经修改原稿')]))
        return envelope(json.dumps(output()))
    app, context, _ = setup(tmp_path, handler)
    with context as client:
        video = fixture_video(app, client, tmp_path);state.update(video=video,app=app)
        result = client.post('/api/videos/'+video['id']+'/review', json=review_body(video)).json()
        assert result['state'] == 'succeeded' and result['stale']
        assert result['original_script'] == video['versions'][0]['segments'][0]['text']


def test_v2_migration_preserves_records_and_interrupts_review(tmp_path):
    app, context, _ = setup(tmp_path, mode='mock')
    with context as client:
        video = fixture_video(app, client, tmp_path)
        challenge = client.post('/api/challenges', json=payload()).json()
    database = tmp_path/'data/app.db'
    with sqlite3.connect(database) as con:
        old = {table:con.execute('SELECT * FROM '+table).fetchall() for table in ('challenges','videos')}
        con.execute('DROP TABLE video_reviews');con.execute('PRAGMA user_version=2')
    with TestClient(create_app(Config(data_dir=tmp_path/'data',mode='mock'))) as client:
        assert client.get('/api/videos/'+video['id']).json() == video
        assert client.get('/api/challenges/'+challenge['id']).json() == challenge
        repository = client.app.state.reviews
        repository.reserve(video['id'], review_body(video))
    assert (tmp_path/'data/app.pre-review-v2.db').is_file()
    with TestClient(create_app(Config(data_dir=tmp_path/'data'))) as client:
        interrupted = client.get('/api/videos/'+video['id']+'/reviews').json()['items'][0]
        assert interrupted['state'] == 'interrupted' and interrupted['ai_script'] is None
    with sqlite3.connect(database) as con:
        assert con.execute('PRAGMA user_version').fetchone()[0] == 3
        for table, rows in old.items(): assert con.execute('SELECT * FROM '+table).fetchall() == rows
