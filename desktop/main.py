"""Local HTTP shell. No JS-to-Python business bridge and no automatic model download."""
import ctypes
import json
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
import socket
import sys
import threading
import time

from backend.version import VERSION
from .paths import prepare


class LocalServer:
    def __init__(self, port=8765):
        self.port = port
        self.socket = None
        self.thread = None
        self.server = None

    def start(self):
        import uvicorn
        from backend.main import create_app
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        if os.name == 'nt':
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        self.socket.bind(('127.0.0.1', self.port))
        self.socket.listen(128)
        self.port = self.socket.getsockname()[1]
        self.server = uvicorn.Server(uvicorn.Config(create_app(), host='127.0.0.1', port=self.port,
            # Windows Proactor transports can retain reset WebView connections on shutdown.
            # ASR uses controlled synchronous subprocesses, so a socket-only selector loop suffices.
            log_config=None, access_log=False, log_level='warning', loop='asyncio:SelectorEventLoop',
            http='h11', ws='none', timeout_graceful_shutdown=5, timeout_keep_alive=2))
        self.thread = threading.Thread(target=self.server.run, kwargs={'sockets':[self.socket]}, daemon=True, name='LianZhi HTTP')
        self.thread.start()
        deadline = time.monotonic()+15
        while not self.server.started:
            if not self.thread.is_alive() or time.monotonic()>deadline:
                raise RuntimeError('服务启动失败；该数据目录可能已有应用运行，请查看日志。')
            time.sleep(.05)
        return f'http://127.0.0.1:{self.port}/'

    def close(self):
        if self.server:
            self.server.should_exit = True
        if self.thread:
            self.thread.join(timeout=12)
        if self.socket:
            self.socket.close()
        if self.thread and self.thread.is_alive():
            raise RuntimeError('服务尚未停止，请稍候再启动。')


def build_info():
    from backend.config import ROOT
    file = ROOT/'build-info.json'
    return json.loads(file.read_text(encoding='utf-8')) if file.is_file() else {'version':VERSION, 'commit':'source', 'candidate':True}


def main():
    paths = prepare()
    handler = RotatingFileHandler(paths['logs']/'desktop.log', maxBytes=1024*1024, backupCount=2, encoding='utf-8')
    logging.basicConfig(handlers=[handler], level=logging.WARNING, format='%(asctime)s %(levelname)s %(name)s %(message)s')
    server = LocalServer(int(os.environ.get('LIANZHI_DESKTOP_PORT', '8765')))
    status = 0
    try:
        import webview
        webview.settings['ALLOW_DOWNLOADS'] = True  # Preserve the existing Markdown export action.
        webview.settings['ALLOW_FILE_URLS'] = False
        # Explicit Edge renderer: never silently fall back to obsolete MSHTML.
        url = server.start()
        test = os.environ.get('LIANZHI_DESKTOP_TEST') == '1'
        if test and os.environ.get('LIANZHI_DEBUG_PORT'):
            webview.settings['REMOTE_DEBUGGING_PORT'] = int(os.environ['LIANZHI_DEBUG_PORT'])
        window = webview.create_window(f'炼知 LianZhi v{VERSION}', url, width=1200, height=840, min_size=(375,600))
        def ready():
            if test and os.environ.get('LIANZHI_READY_FILE'):
                Path(os.environ['LIANZHI_READY_FILE']).write_text(json.dumps({'url':url,'pid':os.getpid(),**build_info()}),encoding='utf-8')
        window.events.loaded += ready
        def test_close():
            # Opt-in local acceptance only, no remotely callable shutdown endpoint.
            if test and os.environ.get('LIANZHI_CLOSE_FILE'):
                while not Path(os.environ['LIANZHI_CLOSE_FILE']).exists() and webview.windows:
                    time.sleep(.1)
                if webview.windows:
                    window.destroy()
        webview.start(test_close, gui='edgechromium', debug=False, private_mode=False, storage_path=str(paths['cache']/'webview'))
    except Exception as exc:
        # Exception text can originate from third parties; avoid logging secrets or user content.
        logging.error('Desktop startup/shutdown failure: %s', type(exc).__name__)
        message = '炼知无法启动。请检查 Edge WebView2 Runtime、目录权限、8765端口及是否已有同目录应用运行。\n日志：'+str(paths['logs']/'desktop.log')
        if os.name == 'nt' and os.environ.get('LIANZHI_DESKTOP_TEST') != '1':
            ctypes.windll.user32.MessageBoxW(None, message, '炼知启动失败', 0x10)
        status = 1
    finally:
        try:
            server.close()
        except RuntimeError:
            logging.error('Local server shutdown timed out')
            status = 1
        handler.close()
    return status
