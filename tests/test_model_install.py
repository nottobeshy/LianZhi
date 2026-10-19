"""Fixed model, atomic promotion, failure retention and contained child lifecycle; no downloads."""
import hashlib
import io
import json
import os
import threading
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from backend.config import Config
from backend.main import create_app
import scripts.download_asr_model as download


@pytest.fixture
def model(tmp_path,monkeypatch):
    weights=b'public model fixture'
    monkeypatch.setattr(download,'WEIGHT_SHA256',hashlib.sha256(weights).hexdigest())
    def populate(directory,valid=True):
        directory.mkdir(parents=True,exist_ok=True)
        for name in download.FILES:(directory/name).write_bytes(weights if name=='model.bin' and valid else b'fixture')
    return tmp_path/'model',populate


def test_atomic_install_and_verified_reuse(model,monkeypatch):
    import huggingface_hub
    target,populate=model;calls=[];events=[]
    def snapshot(repo,**kwargs):
        calls.append(kwargs);assert not target.exists();populate(Path(kwargs['local_dir']))
    monkeypatch.setattr(huggingface_hub,'snapshot_download',snapshot)
    download.install(target,lambda **event:events.append(event))
    assert download.valid_model(target)
    assert calls[0]['token'] is False and calls[0]['revision']==download.REVISION
    assert events[-1]['state']=='ready' and any(e['state']=='verifying' for e in events)
    download.install(target)
    assert len(calls)==1,'Already verified model must not download again'


@pytest.mark.parametrize('failure',['network','checksum'])
def test_failed_install_never_promotes_partial_or_overwrites_old(model,monkeypatch,failure):
    import huggingface_hub
    target,populate=model;populate(target,False);before=(target/'model.bin').read_bytes()
    def snapshot(repo,**kwargs):
        populate(Path(kwargs['local_dir']),False)
        if failure=='network':raise OSError('fixture network failure')
    monkeypatch.setattr(huggingface_hub,'snapshot_download',snapshot)
    with pytest.raises((OSError,ValueError)):download.install(target)
    assert (target/'model.bin').read_bytes()==before
    assert not (target/'MODEL_INFO.json').exists()


def test_install_respects_cross_process_directory_lock(model):
    from backend.lock import data_lock
    target,_=model
    with data_lock(target.with_name(target.name+'.install-lock')):
        with pytest.raises(RuntimeError):download.install(target)


def test_corrupt_staged_download_can_retry(model,monkeypatch):
    import huggingface_hub
    target,populate=model;calls=[]
    def snapshot(repo,**kwargs):
        calls.append(kwargs);populate(Path(kwargs['local_dir']),valid=len(calls)>1)
    monkeypatch.setattr(huggingface_hub,'snapshot_download',snapshot)
    with pytest.raises(ValueError):download.install(target)
    download.install(target)
    assert calls[1]['force_download'] is True and download.valid_model(target)


def test_installer_containment_sanitization_and_idempotence(tmp_path,monkeypatch):
    import desktop.model_install as module
    calls=[];released=threading.Event()
    class Lines:
        def __iter__(self):
            released.wait(2)
            yield json.dumps({'state':'downloading','downloaded':10,'total':20})
            yield json.dumps({'state':'ready'})
        def close(self):pass
    class Process:
        stdout=Lines()
        def poll(self):return 0 if released.is_set() else None
        def wait(self,timeout=None):return 0
        def kill(self):released.set()
    class Job:
        def add(self,p):pass
        def close(self):released.set()
    def popen(command,**kwargs):calls.append((command,kwargs));return Process()
    monkeypatch.setattr(module,'ChildJob',Job);monkeypatch.setattr(module.subprocess,'Popen',popen)
    monkeypatch.setenv('LLM_API_KEY','fixture-private-key');monkeypatch.setenv('HF_TOKEN','fixture-private-token')
    installer=module.ModelInstaller(tmp_path/'model');installer.start();installer.start()
    released.set();installer.thread.join(timeout=3)
    assert len(calls)==1 and installer.status()['state']=='ready'
    assert '--events' in calls[0][0]
    assert not any(k.startswith(('LLM_','HF_TOKEN')) for k in calls[0][1]['env'])
    installer.start();assert len(calls)==1
    installer.close();assert not installer.thread.is_alive()


def test_installer_close_terminates_download(tmp_path,monkeypatch):
    import desktop.model_install as module
    launched=threading.Event();stopped=threading.Event()
    class Lines:
        def __iter__(self):stopped.wait(3);return iter([])
        def close(self):pass
    class Process:
        stdout=Lines()
        def poll(self):return 1 if stopped.is_set() else None
        def wait(self,timeout=None):return 1
        def kill(self):stopped.set()
    class Job:
        def add(self,p):launched.set()
        def close(self):stopped.set()
    monkeypatch.setattr(module,'ChildJob',Job);monkeypatch.setattr(module.subprocess,'Popen',lambda *a,**k:Process())
    installer=module.ModelInstaller(tmp_path/'model');installer.start();assert launched.wait(2)
    installer.close();assert stopped.is_set() and not installer.thread.is_alive()
    assert installer.status()['state']=='cancelled'


def test_desktop_install_status_retry_and_source_opt_out(tmp_path,monkeypatch):
    class Installer:
        started=0;closed=False
        def status(self):return {'state':'downloading','message':'fixture'}
        def start(self):self.started+=1
        def close(self):self.closed=True
    monkeypatch.setenv('LIANZHI_AUTO_INSTALL_ASR','0')
    installer=Installer()
    with TestClient(create_app(Config(data_dir=tmp_path,mode='mock'),model_installer=installer)) as client:
        assert installer.started==0
        assert client.get('/api/health').json()['asr']['installation']['state']=='downloading'
        assert client.post('/api/asr/model/install',json={}).status_code==200
        assert installer.started==1
        assert client.post('/api/asr/model/install',json={},headers={'origin':'https://outside.invalid'}).status_code==403
    assert installer.closed
    with TestClient(create_app(Config(data_dir=tmp_path,mode='mock'))) as source:
        assert not any(getattr(route,'path',None)=='/api/asr/model/install' for route in source.app.routes)
