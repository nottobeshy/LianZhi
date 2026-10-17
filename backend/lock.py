import os
from contextlib import contextmanager


@contextmanager
def data_lock(directory):
    directory.mkdir(parents=True, exist_ok=True)
    handle = (directory / 'app.lock').open('a+b')
    try:
        handle.seek(0, 2)
        if not handle.tell():
            handle.write(b'0'); handle.flush()
        handle.seek(0)
        if os.name == 'nt':
            import msvcrt
            msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        handle.close()
        raise RuntimeError('该数据目录已有应用运行，请先关闭旧服务。') from None
    try:
        yield
    finally:
        handle.close()
