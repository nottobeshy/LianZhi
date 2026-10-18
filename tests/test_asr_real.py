"""Opt-in actual CPU model test; private recording is never part of pytest fixtures/Git."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time
import httpx
import pytest
from backend.config import ROOT
from tests.test_process import server
from tests.test_video import make_mp4
from backend.config import Config
from backend.main import create_app
from backend.db import Problem
from fastapi.testclient import TestClient


@pytest.mark.skipif(not os.environ.get('LIANZHI_ASR_TEST_VIDEO'), reason='Opt-in private recording not configured; no implicit model/media download')
def test_real_cpu_video_ui_confirm_sqlite_process_restart(tmp_path):
    video=Path(os.environ['LIANZHI_ASR_TEST_VIDEO']).resolve()
    model=Path(os.environ.get('LIANZHI_ASR_MODEL_DIR',ROOT/'models/faster-whisper-small')).resolve()
    original_hash=hashlib.sha256(video.read_bytes()).hexdigest()
    with server(tmp_path,{'LIANZHI_ASR_MODEL_DIR':str(model)}) as base:
        with video.open('rb') as source:
            response=httpx.post(base+'/api/videos',content=source,headers={'Content-Type':'video/mp4','X-File-Name':'new-recording.mp4','X-Request-Id':'actual-new-video','Content-Length':str(video.stat().st_size)},timeout=65,trust_env=False)
        assert response.status_code==201, 'Actual upload failed; private response omitted'
        record=response.json()
        started=time.perf_counter()
        response=httpx.post(base+'/api/videos/'+record['id']+'/transcribe',json=dict(request_id='actual-asr',expected_revision=record['revision']),timeout=10,trust_env=False)
        assert response.status_code==202, 'Actual task start failed'
        for _ in range(3000):
            record=httpx.get(base+'/api/videos/'+record['id'],trust_env=False).json()
            if record['state']!='running':break
            # HTTP service stays responsive during the model child.
            assert httpx.get(base+'/api/health',timeout=3,trust_env=False).status_code==200
            time.sleep(.2)
        assert record['state']=='transcribed', 'Actual inference failed: '+str((record.get('error') or {}).get('code'))
        raw=record['raw_transcript']
        assert any(re.search('[\u4e00-\u9fff]',s['text']) for s in raw['segments']), 'No Chinese characters'
        assert bool(raw['source_sha256']==original_hash), 'Source fingerprint differs'
        assert raw['device']=='cpu' and raw['compute_type']=='int8'
        result=subprocess.run(['node',str(ROOT/'tests/frontend-video-http.cjs')],cwd=ROOT,
            env={**os.environ,'TEST_BASE_URL':base,'TEST_VIDEO_ID':record['id']},capture_output=True,text=True,encoding='utf-8',timeout=30)
        assert result.returncode==0, 'Actual frontend script validation failed; private output omitted'
        saved=httpx.get(base+'/api/videos/'+record['id'],trust_env=False).json()
        assert bool(saved['raw_transcript']==raw), 'Original transcript was changed'
        assert saved['confirmed_version_id'] and len(saved['versions'])==1
        evidence={k:raw[k] for k in ('model','model_revision','duration','elapsed_seconds','peak_process_rss_mib','device','compute_type')}
        evidence.update(segments=len(raw['segments']),chinese_characters=sum(len(re.findall('[\u4e00-\u9fff]',s['text'])) for s in raw['segments']),http_elapsed_seconds=round(time.perf_counter()-started,3),video_id=record['id'])
    with server(tmp_path,{'LIANZHI_ASR_MODEL_DIR':str(model)}) as base:
        restarted=httpx.get(base+'/api/videos/'+record['id'],trust_env=False).json()
        assert bool(restarted==saved), 'Record differs after actual process restart'
        assert httpx.get(base+'/api/videos/'+record['id']+'/media',headers={'Range':'bytes=0-31'},trust_env=False).status_code==206
        result=subprocess.run(['node',str(ROOT/'tests/frontend-video-http.cjs')],cwd=ROOT,
            env={**os.environ,'TEST_BASE_URL':base,'TEST_VIDEO_ID':record['id'],'TEST_READ_ONLY':'1'},capture_output=True,text=True,encoding='utf-8',timeout=30)
        assert result.returncode==0, 'Fresh frontend failed to load persisted video'
    assert bool(hashlib.sha256(video.read_bytes()).hexdigest()==original_hash), 'Source recording changed'
    # Aggregate evidence only; never write private text to a test snapshot.
    (tmp_path/'asr-evidence.json').write_text(json.dumps(evidence,indent=2),encoding='utf-8')
    print('Actual CPU ASR metrics:',json.dumps(evidence,ensure_ascii=True))


@pytest.mark.skipif(not os.environ.get('LIANZHI_ASR_TEST_VIDEO'), reason='Opt-in local small model required')
def test_real_silence_is_not_replaced_with_mock(tmp_path):
    video=tmp_path/'silence.mp4'
    make_mp4(video)
    app=create_app(Config(data_dir=tmp_path/'data'))
    with TestClient(app):
        with pytest.raises(Problem) as failure:
            app.state.videos.run_worker(video)
        assert failure.value.code=='NO_SPEECH'


@pytest.mark.skipif(not (os.environ.get('LIANZHI_ASR_TEST_VIDEO') and os.environ.get('LIANZHI_BROWSER_TEST') == '1'),
                    reason='Opt-in local video, model and installed Playwright/Chromium required')
def test_real_browser_upload_confirm_and_restart(tmp_path):
    make_mp4(tmp_path/'silence.mp4')
    def browser(base, **extra):
        result = subprocess.run(['node', str(ROOT/'tests/browser-video-upload.cjs')], cwd=ROOT,
            env={**os.environ, 'TEST_BASE_URL':base, 'TEST_BROWSER_SCREENSHOT':str(tmp_path/'browser.png'),
                 'TEST_SILENCE_VIDEO':str(tmp_path/'silence.mp4'), **extra},
            capture_output=True, text=True, encoding='utf-8', timeout=240)
        assert result.returncode == 0, result.stderr
        return json.loads(result.stdout.strip().splitlines()[-1])
    with server(tmp_path/'data') as base:
        evidence = browser(base)
        saved = httpx.get(base+'/api/videos/'+evidence['id'], trust_env=False).json()
    with server(tmp_path/'data') as base:
        assert httpx.get(base+'/api/videos/'+evidence['id'], trust_env=False).json() == saved
        evidence['restart'] = browser(base, TEST_READ_ONLY='1', TEST_VIDEO_ID=evidence['id'])
    (tmp_path/'browser-evidence.json').write_text(json.dumps(evidence, indent=2), encoding='utf-8')
    print('Actual browser upload/ASR:', json.dumps(evidence))
