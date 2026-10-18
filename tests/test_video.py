"""Generated media fixtures + explicit ASR substitute; no user recordings/model downloads."""
import copy
import errno
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import threading
import time
from fractions import Fraction
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from backend.config import Config
from backend.db import Problem
from backend.main import create_app
from backend.schemas import ASRResult
from tests.test_backend import payload


def make_mp4(path, audio=True, seconds=1):
    av = pytest.importorskip('av')
    np = pytest.importorskip('numpy')
    with av.open(str(path), 'w', format='mp4') as out:
        video = out.add_stream('mpeg4', rate=Fraction(10,seconds))
        video.width = video.height = 64
        video.pix_fmt = 'yuv420p'
        if audio:
            sound = out.add_stream('aac', rate=16000)
            sound.layout = 'mono'
        for i in range(10):
            frame = av.VideoFrame.from_ndarray(np.zeros((64,64,3),dtype=np.uint8),format='rgb24')
            frame.pts, frame.time_base = i, Fraction(seconds,10)
            for packet in video.encode(frame): out.mux(packet)
        for packet in video.encode(): out.mux(packet)
        if audio:
            frame = av.AudioFrame.from_ndarray(np.zeros((1,16000),dtype=np.float32),format='fltp',layout='mono')
            frame.sample_rate = 16000
            frame.pts, frame.time_base = 0, Fraction(1,16000)
            for packet in sound.encode(frame): out.mux(packet)
            for packet in sound.encode(): out.mux(packet)
    return path.read_bytes()


def upload(client, content, request_id='upload-1', name='sample.mp4'):
    return client.post('/api/videos', content=content, headers={'Content-Type':'video/mp4','X-File-Name':name,'X-Request-Id':request_id})


def fake_result(path):
    return dict(engine='faster-whisper',engine_version='test-substitute',model='Systran/faster-whisper-small',
                model_revision='536b0662742c02347bc0e980a01041f333bce120',language='zh',device='cpu',compute_type='int8',
                duration=1.0,elapsed_seconds=.01,peak_process_rss_mib=None,source_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                segments=[dict(segment_id='s1',start=0.0,end=1.0,text='测试替身：知识讲解原稿。')])


def wait_done(client, video_id):
    for _ in range(400):
        record = client.get('/api/videos/'+video_id).json()
        if record['state'] != 'running': return record
        time.sleep(.02)
    raise AssertionError('Video task did not finish')


def stub_inference(app, monkeypatch, failure=None, gate=None):
    service = app.state.videos
    real_worker = service.run_worker
    def worker(path, probe=False):
        if probe: return real_worker(path, True)
        if gate: gate.wait(timeout=5)
        if failure: raise Problem(failure, '明确的测试推理失败', 503)
        return ASRResult.model_validate(fake_result(path)).model_dump()
    monkeypatch.setattr(service,'run_worker',worker)
    monkeypatch.setattr(service,'status',lambda:{'installed':True,'model_present':True})


def test_upload_transcribe_edit_confirm_history_and_reload(tmp_path, monkeypatch):
    media = make_mp4(tmp_path/'source.mp4')
    app = create_app(Config(data_dir=tmp_path/'data'))
    stub_inference(app,monkeypatch)
    with TestClient(app) as client:
        record = upload(client,media).json()
        assert record['metadata']['duration'] > 0
        assert upload(client,media).json()['id'] == record['id']
        assert len(client.get('/api/videos').json()['items']) == 1
        assert upload(client,media+b'changed').status_code == 409
        body = dict(request_id='asr-1',expected_revision=record['revision'])
        response = client.post('/api/videos/'+record['id']+'/transcribe',json=body)
        assert response.status_code == 202
        original = wait_done(client,record['id'])
        assert original['state'] == 'transcribed'
        assert client.post('/api/videos/'+record['id']+'/transcribe',json=body).json()['raw_transcript'] == original['raw_transcript']
        raw = copy.deepcopy(original['raw_transcript'])
        edit = dict(request_id='edit-1',expected_revision=original['revision'],confirm=True,
                    segments=[dict(segment_id='s1',text='人工修订 <原稿>')])
        confirmed = client.post('/api/videos/'+record['id']+'/transcript',json=edit).json()
        assert confirmed['raw_transcript'] == raw
        assert confirmed['versions'][0]['segments'][0]['text'] == edit['segments'][0]['text']
        assert client.post('/api/videos/'+record['id']+'/transcript',json=edit).json() == confirmed
        edit.update(request_id='edit-2',expected_revision=confirmed['revision'],confirm=False,
                    segments=[dict(segment_id='s1',text='再次修改')])
        draft = client.post('/api/videos/'+record['id']+'/transcript',json=edit).json()
        assert draft['confirmed_version_id'] is None
        assert draft['versions'] == confirmed['versions']
        edit.update(request_id='edit-3',expected_revision=draft['revision'],confirm=True)
        final = client.post('/api/videos/'+record['id']+'/transcript',json=edit).json()
        assert len(final['versions']) == 2 and final['versions'][0] == confirmed['versions'][0]
        assert client.get('/api/videos/'+record['id']+'/media',headers={'Range':'bytes=0-31'}).status_code == 206
    with TestClient(create_app(Config(data_dir=tmp_path/'data'))) as client:
        assert client.get('/api/videos/'+record['id']).json() == final
    assert not list((tmp_path/'data/videos').glob('*.upload.mp4'))


@pytest.mark.parametrize('kind,code',[('no-audio','NO_AUDIO'),('invalid','UNSUPPORTED_MEDIA'),('broken','DECODE_ERROR')])
def test_real_media_validation_failures(tmp_path, kind, code):
    content = make_mp4(tmp_path/'silent.mp4',audio=False) if kind=='no-audio' else b'invalid mp4'
    if kind=='broken': content=b'\x00\x00\x00\x20ftypisom'+b'\x00'*52
    with TestClient(create_app(Config(data_dir=tmp_path/'data'))) as client:
        response = upload(client,content)
        assert response.status_code == 422
        assert response.json()['error']['code'] == code
        assert client.get('/api/videos').json()['items'] == []
    assert list((tmp_path/'data/videos').iterdir()) == []


def test_upload_limits_origin_paths_and_write_failure(tmp_path, monkeypatch):
    app=create_app(Config(data_dir=tmp_path))
    with TestClient(app) as client:
        assert upload(client,b'bad',name='../escape.mp4').status_code == 400
        assert upload(client,b'').status_code == 400
        assert client.post('/api/videos',content=b'bad',headers={'Content-Type':'video/mp4','X-File-Name':'file.mp4','X-Request-Id':'limit','Content-Length':str(104857601)}).status_code == 413
        assert client.post('/api/videos',content=b'bad',headers={'Content-Type':'video/mp4','Origin':'https://evil.test'}).status_code == 403
        import backend.video_routes as routes
        monkeypatch.setattr(routes,'MAX_BYTES',4)
        assert client.post('/api/videos',content=iter([b'abc',b'def']),headers={'Content-Type':'video/mp4','X-File-Name':'file.mp4','X-Request-Id':'stream'}).status_code == 413
        original_open=Path.open
        def denied(path,*args,**kwargs):
            if path.name.endswith('.upload.mp4'): raise PermissionError('test')
            return original_open(path,*args,**kwargs)
        monkeypatch.setattr(Path,'open',denied)
        assert upload(client,b'1','denied').json()['error']['code'] == 'STORAGE_ERROR'
        assert not list((tmp_path/'videos').iterdir())


def test_real_duration_limit(tmp_path):
    media=make_mp4(tmp_path/'long.mp4',seconds=181)
    with TestClient(create_app(Config(data_dir=tmp_path/'data'))) as client:
        response=upload(client,media)
        assert response.status_code==422 and response.json()['error']['code']=='DURATION_LIMIT'


def test_upload_disk_full_is_reported_and_cleans_up(tmp_path, monkeypatch):
    original_open = Path.open
    def full(path, *args, **kwargs):
        if path.name.endswith('.upload.mp4'):
            raise OSError(errno.ENOSPC, 'simulated disk full')
        return original_open(path, *args, **kwargs)
    with TestClient(create_app(Config(data_dir=tmp_path))) as client:
        monkeypatch.setattr(Path, 'open', full)
        response = upload(client, b'x' * 65537)
        assert response.status_code == 503 and response.json()['error']['code'] == 'STORAGE_ERROR'
        assert client.get('/api/videos').json()['items'] == []
        assert list((tmp_path/'videos').iterdir()) == []


def test_missing_engine_status(tmp_path,monkeypatch):
    app=create_app(Config(data_dir=tmp_path))
    with TestClient(app) as client:
        monkeypatch.setattr(app.state.videos,'status',lambda:{'installed':False,'model_present':False})
        response=client.post('/api/videos/'+str(uuid4())+'/transcribe',json=dict(request_id='missing',expected_revision=1))
        assert response.status_code==503 and response.json()['error']['code']=='ASR_NOT_INSTALLED'


def test_missing_model_busy_and_task_failure(tmp_path,monkeypatch):
    media=make_mp4(tmp_path/'media.mp4')
    app=create_app(Config(data_dir=tmp_path/'data',asr_model_dir=tmp_path/'missing'))
    with TestClient(app) as client:
        record=upload(client,media).json()
        body=dict(request_id='missing',expected_revision=record['revision'])
        assert client.post('/api/videos/'+record['id']+'/transcribe',json=body).json()['error']['code']=='MODEL_NOT_INSTALLED'
        gate=threading.Event()
        stub_inference(app,monkeypatch,failure='ASR_ERROR',gate=gate)
        response=client.post('/api/videos/'+record['id']+'/transcribe',json=body)
        assert response.status_code==202
        other=upload(client,media,'other-upload').json()
        assert client.post('/api/videos/'+other['id']+'/transcribe',json=dict(request_id='busy',expected_revision=1)).status_code==409
        gate.set()
        failed=wait_done(client,record['id'])
        assert failed['state']=='failed' and failed['error']['code']=='ASR_ERROR'
        assert failed['raw_transcript'] is None


def test_transcript_limits_stale_and_timeline(tmp_path,monkeypatch):
    media=make_mp4(tmp_path/'media.mp4')
    app=create_app(Config(data_dir=tmp_path/'data'))
    stub_inference(app,monkeypatch)
    with TestClient(app) as client:
        record=upload(client,media).json()
        client.post('/api/videos/'+record['id']+'/transcribe',json=dict(request_id='start',expected_revision=1))
        record=wait_done(client,record['id'])
        base=dict(request_id='save',expected_revision=record['revision'],confirm=True,segments=[dict(segment_id='s1',text='')])
        endpoint='/api/videos/'+record['id']+'/transcript'
        assert client.post(endpoint,json=base).json()['error']['code']=='EMPTY_TRANSCRIPT'
        assert client.post(endpoint,json={**base,'segments':[dict(segment_id='wrong',text='x')]}).status_code==400
        assert client.post(endpoint,json={**base,'segments':[dict(segment_id='s1',text='x'*2001)]}).status_code==422
        assert client.post(endpoint,json={**base,'expected_revision':1}).status_code==409
        bad=fake_result(tmp_path/'media.mp4');bad['segments'][0]['end']=float('nan')
        with pytest.raises(ValueError):ASRResult.model_validate(bad)


def test_v1_migration_preserves_challenges_and_interrupts_jobs(tmp_path):
    from backend.db import Database
    # Create a real v1 fixture without loading the new initializer.
    data=tmp_path/'app.db'
    with sqlite3.connect(data) as con:
        con.execute('CREATE TABLE challenges(id TEXT PRIMARY KEY,data TEXT NOT NULL)')
        con.execute('INSERT INTO challenges VALUES(?,?)',('old',json.dumps({'original':'旧版解释保留'})))
        con.execute('PRAGMA user_version=1')
    db=Database(tmp_path);db.initialize()
    assert db.get('old')=={'original':'旧版解释保留'}
    assert (tmp_path/'app.pre-video-v1.db').is_file()
    from backend.video_db import VideoRepository
    repo=VideoRepository(db)
    record=repo.create(str(uuid4()),'up',dict(name='a.mp4',size=1,sha256='0'*64),dict(duration=1))
    repo.start(record['id'],dict(request_id='run',expected_revision=1))
    db.initialize()
    assert repo.get(record['id'])['state']=='interrupted'
    with sqlite3.connect(data) as con:assert con.execute('PRAGMA user_version').fetchone()[0]==3
