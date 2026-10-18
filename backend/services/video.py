"""One local ASR child at a time; HTTP threads only submit/query commands."""
from concurrent.futures import ThreadPoolExecutor
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import threading
from uuid import UUID
from pydantic import ValidationError
from ..config import ROOT
from ..db import Problem
from ..schemas import ASRResult
from ..process_guard import ChildJob
from ..video_db import VideoRepository
from .asr import MAX_BYTES, MAX_SECONDS, MODEL_REPO, MODEL_REVISION


class VideoService:
    def __init__(self, config, database):
        self.config, self.repository = config, VideoRepository(database)
        self.media_dir = config.data_dir / 'videos'
        self.lock, self.upload_lock = threading.Lock(), threading.Lock()
        self.process_lock = threading.Lock()
        self.processes = set()
        self.child_job = None
        self.stopping = False
        self.executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix='local-asr')
        self.storage_errors = set()

    def status(self):
        installed = all(importlib.util.find_spec(name) for name in ('av', 'faster_whisper', 'ctranslate2'))
        model_present = all((self.config.asr_model_dir / name).is_file() for name in ('model.bin','config.json','tokenizer.json','vocabulary.txt'))
        return dict(engine='faster-whisper', model=MODEL_REPO, model_revision=MODEL_REVISION, device='cpu',
                    compute_type='int8', installed=installed, model_present=model_present, available=bool(installed and model_present),
                    max_bytes=MAX_BYTES, max_seconds=MAX_SECONDS)

    def media_path(self, video_id):
        try:
            video_id = str(UUID(video_id))
        except (ValueError, AttributeError):
            raise Problem('NOT_FOUND', '视频记录不存在。', 404) from None
        path = self.media_dir / (video_id + '.mp4')
        if path.resolve().parent != self.media_dir.resolve() or path.is_symlink():
            raise Problem('MEDIA_PATH', '媒体路径异常。', 503)
        return path

    def run_worker(self, video, probe=False):
        env = {k:v for k,v in os.environ.items() if not k.startswith(('LLM_', 'HF_TOKEN'))}
        env.update(HF_HUB_OFFLINE='1', TRANSFORMERS_OFFLINE='1', PYTHONIOENCODING='utf-8')
        command = [sys.executable, '-m', 'backend.asr_worker', '--video', str(video), '--model-dir', str(self.config.asr_model_dir)]
        if probe:
            command.append('--probe-only')
        with self.process_lock:
            try:
                if self.child_job is None:
                    self.child_job = ChildJob()
                process = subprocess.Popen(command, cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                           creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
                self.child_job.add(process)
            except OSError:
                raise Problem('PROCESS_CONTROL', '无法启动受控媒体子进程；本轮仅支持Windows本机转写，请检查系统限制。', 503) from None
            self.processes.add(process)
            if self.stopping:
                process.terminate()
        try:
            try:
                stdout, _ = process.communicate(timeout=15 if probe else self.config.asr_timeout)
            except subprocess.TimeoutExpired:
                process.kill()
                process.communicate()
                raise Problem('MEDIA_TIMEOUT' if probe else 'ASR_TIMEOUT', '本地媒体处理超时，进程已停止；原文件保留。', 504) from None
            if self.stopping:
                raise Problem('INTERRUPTED', '转写随应用退出中断，请显式重新启动。', 503)
            if process.returncode or len(stdout) > 1048576:
                raise Problem('ASR_ERROR', '本地处理进程失败或结果过大；未使用Mock替代。', 503)
            try:
                message = json.loads(stdout)
                if 'error' in message:
                    error = message['error']
                    raise Problem(error['code'], error['message'], 503)
                return message['result'] if probe else ASRResult.model_validate(message['result']).model_dump()
            except (ValueError, TypeError, KeyError, ValidationError):
                raise Problem('INVALID_TRANSCRIPT', '本地转写结果不符合时间轴或文本协议。', 503) from None
        finally:
            with self.process_lock:
                self.processes.discard(process)

    def get(self, video_id):
        data = self.repository.get(video_id)
        if video_id in self.storage_errors:
            data.update(state='failed', error={'code':'STORAGE_ERROR','message':'转写结果未能写入SQLite，请检查目录权限/磁盘后重启并重试。'})
        return data

    def start(self, video_id, payload):
        if self.repository.replay(video_id, 'transcribe', payload):
            return self.get(video_id)
        status = self.status()
        if not status['installed']:
            raise Problem('ASR_NOT_INSTALLED', '本地ASR依赖未安装，请按ASR复现说明安装。', 503)
        if not status['model_present']:
            raise Problem('MODEL_NOT_INSTALLED', '本地small模型未安装；应用不会自动下载，请按ASR复现说明准备。', 503)
        if not self.lock.acquire(blocking=False):
            raise Problem('BUSY', '已有本地视频转写运行，请等待完成。', 409)
        try:
            record = self.repository.start(video_id, payload)
            self.executor.submit(self._transcribe, video_id, payload['request_id'])
            return record
        except Exception:
            self.lock.release()
            raise

    def _transcribe(self, video_id, job_id):
        error, result = None, None
        try:
            result = self.run_worker(self.media_path(video_id))
        except Problem as exc:
            error = dict(code=exc.code, message=exc.message)
        except Exception:
            error = dict(code='ASR_ERROR', message='本地转写失败，原视频保留，请检查依赖/权限后显式重试。')
        try:
            self.repository.finish(video_id, job_id, result=result, error=error)
        except (sqlite3.Error, Problem):
            self.storage_errors.add(video_id)
        finally:
            self.lock.release()

    def close(self):
        with self.process_lock:
            self.stopping = True
            for process in self.processes:
                if process.poll() is None:
                    process.terminate()
        self.executor.shutdown(wait=True, cancel_futures=True)
        if self.child_job:
            self.child_job.close()
