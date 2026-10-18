"""Own test child only: Windows hard parent exit must terminate its ASR job."""
import ctypes
from ctypes import wintypes
import os
import subprocess
import sys
import time
import pytest
from backend.config import ROOT


@pytest.mark.skipif(os.name!='nt',reason='Windows Job Object')
def test_child_terminates_on_hard_parent_exit():
    code='''
import subprocess,sys,time
from backend.process_guard import ChildJob
job=ChildJob()
child=subprocess.Popen([sys.executable,'-c','import time;time.sleep(180)'])
job.add(child)
print(child.pid,flush=True)
time.sleep(180)
'''
    parent=subprocess.Popen([sys.executable,'-c',code],cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    kernel=ctypes.WinDLL('kernel32',use_last_error=True)
    kernel.OpenProcess.argtypes=[wintypes.DWORD,wintypes.BOOL,wintypes.DWORD]
    kernel.OpenProcess.restype=wintypes.HANDLE
    kernel.WaitForSingleObject.argtypes=[wintypes.HANDLE,wintypes.DWORD]
    kernel.CloseHandle.argtypes=[wintypes.HANDLE]
    handle=None
    try:
        pid=int(parent.stdout.readline().strip())
        handle=kernel.OpenProcess(0x100000,False,pid)  # SYNCHRONIZE, no arbitrary process control.
        assert handle
        parent.kill();parent.wait(timeout=5)
        assert kernel.WaitForSingleObject(handle,5000)==0, 'ASR child survived parent termination'
    finally:
        if parent.poll() is None:parent.kill();parent.wait(timeout=5)
        if handle:kernel.CloseHandle(handle)
