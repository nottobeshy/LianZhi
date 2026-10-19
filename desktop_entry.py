"""Shared onedir entry: windowed main EXE and hidden console worker EXE."""
import multiprocessing
import sys


def main():
    multiprocessing.freeze_support()
    if len(sys.argv)>1 and sys.argv[1] == '--asr-worker':
        sys.argv.pop(1)
        from backend.asr_worker import main as worker
        worker()
        return 0
    if len(sys.argv)>1 and sys.argv[1] == '--download-asr-model':
        sys.argv.pop(1)
        from desktop.paths import prepare
        from scripts.download_asr_model import main as download
        paths = prepare()
        if '--output' not in sys.argv:
            import os
            sys.argv += ['--output', os.environ['LIANZHI_ASR_MODEL_DIR']]
        download()
        return 0
    if len(sys.argv)>1 and sys.argv[1] == '--version':
        from desktop.main import build_info
        import json
        print(json.dumps(build_info()))
        return 0
    if sys.executable.endswith('LianZhi-worker.exe'):
        print('Use LianZhi.exe to start the application.')
        return 2
    from desktop.main import main as desktop
    return desktop()


if __name__ == '__main__':
    raise SystemExit(main())
