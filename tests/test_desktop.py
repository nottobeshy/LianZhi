"""Desktop boundary checks, no GUI or cloud calls in the default suite."""
import os
from pathlib import Path
import subprocess
import sys
import httpx
import pytest
from backend.config import Config, ROOT, default_model_dir
from backend.version import VERSION


def test_source_resource_and_version():
    assert (ROOT/'demo/index.html').is_file()
    assert (ROOT/'backend/data/topics.json').is_file()
    assert VERSION=='0.1.0'
    assert default_model_dir()==ROOT/'models/faster-whisper-small'


def test_frozen_asr_command(tmp_path,monkeypatch):
    from backend.services.video import VideoService
    from backend.db import Database
    from backend.db import Problem
    import backend.services.video as video
    monkeypatch.setattr(sys,'frozen',True,raising=False)
    monkeypatch.setattr(sys,'executable',str(tmp_path/'LianZhi.exe'))
    monkeypatch.setenv('LIANZHI_ASR_MODEL_DIR',str(tmp_path/'model'))
    calls=[]
    def popen(command,**kwargs):
        calls.append((command,kwargs));raise OSError('fake process boundary')
    monkeypatch.setattr(video.subprocess,'Popen',popen)
    service=VideoService(Config(data_dir=tmp_path),Database(tmp_path))
    try:
        with pytest.raises(Problem):service.run_worker(tmp_path/'sample.mp4',probe=True)
        assert calls[0][0][:2]==[str(tmp_path/'LianZhi-worker.exe'),'--asr-worker']
        assert calls[0][0][-1]=='--probe-only'
        assert calls[0][1]['creationflags']==subprocess.CREATE_NO_WINDOW
        assert not any(k.startswith('LLM_') for k in calls[0][1]['env'])
    finally:service.close()


def test_desktop_paths_do_not_write_bundle(tmp_path,monkeypatch):
    pytest.importorskip('platformdirs')
    from desktop.paths import prepare
    # prepare() sets defaults; isolate the whole mapping, including previously absent keys.
    monkeypatch.setattr(os,'environ',os.environ.copy())
    for name in ['DATA','CACHE','LOG']:
        monkeypatch.setenv('LIANZHI_'+name+'_DIR',str(tmp_path/name))
    monkeypatch.delenv('LIANZHI_ASR_MODEL_DIR',raising=False)
    monkeypatch.delenv('LLM_MAX_REQUESTS',raising=False)
    paths=prepare()
    assert paths['data']==tmp_path/'DATA'
    assert os.environ['LIANZHI_ASR_MODEL_DIR']==str(tmp_path/'CACHE/models/faster-whisper-small')
    assert os.environ['LLM_MAX_REQUESTS']=='0'


def test_local_server_lifecycle(tmp_path,monkeypatch):
    pytest.importorskip('platformdirs')
    from desktop.main import LocalServer
    monkeypatch.setenv('LIANZHI_DATA_DIR',str(tmp_path))
    monkeypatch.setenv('LLM_MODE','mock');monkeypatch.setenv('LLM_API_KEY','')
    server=LocalServer(0)
    try:
        url=server.start()
        with httpx.Client(trust_env=False) as client:
            assert client.get(url+'api/health').json()['database']=='ready'
            assert client.get(url).status_code==200
            assert client.get(url+'api/openapi.json').status_code==404
            assert client.get(url+'openapi.json').json()['info']['version']==VERSION
    finally:server.close()
    assert not server.thread.is_alive()
    # Same profile can start again after a graceful shutdown releases the lock.
    again=LocalServer(0)
    try:assert again.start()
    finally:again.close()


def test_candidate_workflow_has_no_publish_trigger():
    yaml=pytest.importorskip('yaml')
    workflow=yaml.load((ROOT/'.github/workflows/windows-candidate.yml').read_text(encoding='utf-8'),Loader=yaml.BaseLoader)
    assert set(workflow['on'])=={'workflow_dispatch'}
    assert workflow['permissions']=={'contents':'read'}
    assert workflow['jobs']['candidate']['runs-on']==['self-hosted','Windows','X64','lianzhi-candidate']
    assert not any('action-gh-release' in step.get('uses','') for step in workflow['jobs']['candidate']['steps'])


def test_desktop_permission_failure_is_explicit(monkeypatch):
    pytest.importorskip('platformdirs')
    import desktop.main as desktop
    monkeypatch.setenv('LIANZHI_DESKTOP_TEST','1')
    def denied():raise PermissionError('isolated permission fixture')
    monkeypatch.setattr(desktop,'prepare',denied)
    assert desktop.main()==1
