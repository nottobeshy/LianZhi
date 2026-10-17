"""Clean-copy verification; isolated runtime only, no user data or model requests."""
import os
from pathlib import Path
import shutil
import subprocess
import sys
from uuid import uuid4

root = Path(__file__).resolve().parent.parent
target = root / '.test-runtime' / ('reproduce-' + uuid4().hex[:8])
target.mkdir(parents=True)
files = subprocess.check_output(['git', '-c', 'safe.directory='+root.as_posix(), 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode('utf-8').split('\0')
for name in filter(None, files):
    source = root / name
    if not source.is_file():
        continue
    destination = target / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
subprocess.run([sys.executable, '-m', 'venv', str(target/'.venv')], check=True)
python = target / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
subprocess.run([str(python), '-m', 'pip', 'install', '-q', '-r', 'requirements.txt'], cwd=target, check=True)
env = {**os.environ, 'LLM_API_KEY':'', 'LLM_MODE':'mock', 'LIANZHI_DATA_DIR':str(target/'runtime')}
subprocess.run([str(python), '-m', 'pytest', '-q'], cwd=target, env=env, check=True)
for test in sorted((target/'demo/tests').glob('test-*.js')):
    subprocess.run(['node',str(test)], cwd=target/'demo', env=env, check=True, stdout=subprocess.DEVNULL)
print('CLEAN_COPY_PASSED', target)
print('Scope: same Windows machine, fresh virtualenv, actual HTTP process; no browser or live API.')
