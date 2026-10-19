"""One bounded, contained installer child. No media, Key or arbitrary download URL."""
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
from backend.config import ROOT
from backend.process_guard import ChildJob

BUSY = ('checking','downloading','verifying')
MESSAGES = {'missing':'首次启动将自动安装本地语音模型（约486MB）。','checking':'正在检查本地语音模型…',
    'downloading':'正在下载本地语音模型（约486MB），可先使用知识挑战。','verifying':'下载完成，正在校验并安装…',
    'ready':'本地语音模型已就绪。','failed':'模型安装未完成。请检查网络、磁盘空间和目录权限后重试。',
    'cancelled':'模型安装已随窗口关闭停止，可重试。'}


class ModelInstaller:
    def __init__(self,model_dir):
        self.model_dir=Path(model_dir)
        self.lock=threading.Lock();self.process=None;self.job=None;self.thread=None;self.stopping=False
        self.state=dict(state='missing',message=MESSAGES['missing'])

    def status(self):
        with self.lock:return dict(self.state)

    def start(self):
        with self.lock:
            if self.stopping or self.state['state'] in (*BUSY,'ready') or (self.thread and self.thread.is_alive()):return dict(self.state)
            self.state=dict(state='checking',message=MESSAGES['checking'])
            self.thread=threading.Thread(target=self._run,daemon=True,name='ASR model installer')
            self.thread.start()
            return dict(self.state)

    def _run(self):
        prefix=[str(Path(sys.executable).with_name('LianZhi-worker.exe'))] if getattr(sys,'frozen',False) else [sys.executable,str(ROOT/'desktop_entry.py')]
        env={k:v for k,v in os.environ.items() if not k.startswith(('LLM_','HF_TOKEN','HUGGING_FACE_HUB_TOKEN'))}
        env.update(PYTHONIOENCODING='utf-8',HF_HUB_ETAG_TIMEOUT='15',HF_HUB_DOWNLOAD_TIMEOUT='30')
        process=None
        try:
            with self.lock:
                if self.stopping:return
                self.job=ChildJob()
                process=subprocess.Popen(prefix+['--download-asr-model','--output',str(self.model_dir),'--events'],cwd=ROOT,env=env,
                    stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,encoding='utf-8',creationflags=subprocess.CREATE_NO_WINDOW)
                self.process=process;self.job.add(process)
            # Hard ceiling also covers a stalled child before it emits any output.
            timeout=threading.Timer(1800,process.kill);timeout.daemon=True;timeout.start()
            try:
                for line in process.stdout:
                    if len(line)>4096:continue
                    try:event=json.loads(line)
                    except ValueError:continue
                    phase=event.get('state')
                    if phase not in (*BUSY,'ready'):continue
                    with self.lock:
                        self.state=dict(state=phase,message=MESSAGES[phase])
                        done,total=event.get('downloaded'),event.get('total')
                        if phase=='downloading' and type(done) is int and type(total) is int and 0<=done<=total<=1024**3:
                            self.state.update(downloaded=done,total=total)
                code=process.wait(timeout=10)
                with self.lock:
                    if self.stopping:self.state=dict(state='cancelled',message=MESSAGES['cancelled'])
                    elif code or self.state['state']!='ready':self.state=dict(state='failed',message=MESSAGES['failed'])
            finally:timeout.cancel()
        except Exception:
            with self.lock:self.state=dict(state='cancelled' if self.stopping else 'failed',message=MESSAGES['cancelled' if self.stopping else 'failed'])
        finally:
            if process:
                if process.poll() is None:process.kill()
                process.wait(timeout=10);process.stdout.close()
            with self.lock:
                if self.job:self.job.close()
                self.job=None;self.process=None

    def close(self):
        with self.lock:
            self.stopping=True
            if self.state['state'] in BUSY:self.state=dict(state='cancelled',message=MESSAGES['cancelled'])
            if self.job:self.job.close();self.job=None
        if self.thread:self.thread.join(timeout=12)
