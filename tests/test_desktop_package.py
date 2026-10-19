"""Explicit opt-in. Launch an actual Windows EXE and attach to its WebView2 via CDP."""
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import time
import httpx
import pytest


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1',0));return s.getsockname()[1]


@pytest.mark.skipif(not os.environ.get('LIANZHI_DESKTOP_EXE'),reason='Opt-in tested onedir EXE and installed WebView2 required')
def test_actual_webview_package_restart_and_local_asr(tmp_path,request):
    exe=Path(os.environ['LIANZHI_DESKTOP_EXE']).resolve()
    assert exe.is_file()
    package_files={p.relative_to(exe.parent).as_posix() for p in exe.parent.rglob('*') if p.is_file()}
    root=Path(__file__).resolve().parent.parent
    env={k:v for k,v in os.environ.items() if not k.startswith(('LLM_','LIANZHI_','HF_','PYTHON','VIRTUAL_ENV'))}
    env['PATH']=os.environ['SYSTEMROOT']+'\\System32;'+os.environ['SYSTEMROOT']
    ready=tmp_path/'ready.json';close=tmp_path/'close';port=free_port();debug=free_port()
    env.update(LLM_MODE='mock',LLM_MAX_REQUESTS='0',LIANZHI_DATA_DIR=str(tmp_path/'用户 数据'),
        LIANZHI_CACHE_DIR=str(tmp_path/'浏览器 缓存'),LIANZHI_LOG_DIR=str(tmp_path/'日志'),
        LIANZHI_ASR_MODEL_DIR=os.environ['LIANZHI_PACKAGE_MODEL'],LIANZHI_DESKTOP_TEST='1',
        LIANZHI_READY_FILE=str(ready),LIANZHI_CLOSE_FILE=str(close),LIANZHI_DESKTOP_PORT=str(port),LIANZHI_DEBUG_PORT=str(debug))
    results=[]
    from backend.services.credentials import CredentialStore
    request.addfinalizer(lambda:CredentialStore(tmp_path/'用户 数据').delete('https://api.deepseek.com'))
    for restart in [False,True]:
        ready.unlink(missing_ok=True);close.unlink(missing_ok=True)
        process=subprocess.Popen([str(exe)],cwd=tmp_path,env=env,creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            deadline=time.monotonic()+45
            while not ready.exists():
                assert process.poll() is None,'Desktop exited before WebView loaded; inspect isolated log'
                assert time.monotonic()<deadline,'WebView startup timed out'
                time.sleep(.1)
            info=json.loads(ready.read_text(encoding='utf-8'))
            node_env={**os.environ,'TEST_CDP_URL':f'http://127.0.0.1:{debug}', 'TEST_BASE_URL':info['url'].rstrip('/'),
                'TEST_RESTART':str(int(restart)),'TEST_VIDEO_ID':results[0]['video_id'] if restart else '',
                'TEST_SCREENSHOT':str(tmp_path/'desktop.png')}
            result=subprocess.run([shutil.which('node'),str(root/'tests/browser-desktop.cjs')],cwd=tmp_path,env=node_env,
                capture_output=True,text=True,encoding='utf-8',timeout=240)
            assert result.returncode==0,result.stderr
            results.append(json.loads(result.stdout.strip().splitlines()[-1]))
            with httpx.Client(trust_env=False) as client:
                health=client.get(info['url']+'api/health').json()
                assert health['llm']['live_requests']==0 and health['llm']['live_limit']==0
                assert health['asr']['available']
            close.write_text('close',encoding='ascii');assert process.wait(timeout=20)==0
            with pytest.raises(httpx.RequestError):httpx.get(info['url']+'api/health',trust_env=False,timeout=1)
        finally:
            close.write_text('close',encoding='ascii')
            if process.poll() is None:
                try:process.wait(timeout=20)
                except subprocess.TimeoutExpired:process.kill();process.wait(timeout=5)
    (tmp_path/'desktop-evidence.json').write_text(json.dumps(dict(build=info,results=results,cloud_requests=0),indent=2),encoding='utf-8')
    assert 'ERROR' not in (tmp_path/'日志/desktop.log').read_text(encoding='utf-8'), 'Desktop log contains errors; inspect isolated evidence'
    assert {p.relative_to(exe.parent).as_posix() for p in exe.parent.rglob('*') if p.is_file()}==package_files, 'Runtime files appeared inside installation directory'
    print('Actual frozen WebView2 / ASR / vault / restart:',json.dumps(results))
