"""Real loopback HTTP + Node frontend adapter; no external model requests."""
import json
import os
import shutil
import socket
import subprocess
import sys
import time
from contextlib import contextmanager
import httpx
from backend.config import ROOT
from backend.lock import data_lock
import pytest


@contextmanager
def server(tmp_path):
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    env = {**os.environ, 'LIANZHI_DATA_DIR': str(tmp_path), 'LLM_MODE': 'mock', 'LLM_API_KEY': ''}
    process = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', str(port), '--log-level', 'warning'], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    base = f'http://127.0.0.1:{port}'
    try:
        for _ in range(100):
            try:
                if httpx.get(base+'/api/health', trust_env=False).status_code == 200:
                    break
            except httpx.RequestError:
                pass
            if process.poll() is not None:
                raise AssertionError('HTTP process exited before startup')
            time.sleep(.05)
        else:
            raise AssertionError('HTTP startup timed out')
        yield base
    finally:
        process.terminate()
        process.wait(timeout=10)


def test_actual_http_frontend_and_process_restart(tmp_path):
    assert shutil.which('node'), 'Node is required for frontend integration verification'
    with server(tmp_path) as base:
        result = subprocess.run(['node', str(ROOT/'tests/frontend-http.cjs')], env={**os.environ, 'TEST_BASE_URL': base}, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', timeout=30)
        assert result.returncode == 0, result.stdout+result.stderr
        saved = json.loads(result.stdout.strip().splitlines()[-1])
    with server(tmp_path) as base:
        record = httpx.get(base+'/api/challenges/'+saved['id'], trust_env=False).json()
        assert record['explanation'] == saved['explanation']
        assert record['stage'] == 'revised'
        assert record['questions']['origin']['mode'] == 'mock'


def test_data_directory_lock(tmp_path):
    with data_lock(tmp_path):
        with pytest.raises((OSError, RuntimeError)):
            with data_lock(tmp_path):
                pass
