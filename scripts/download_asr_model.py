"""Explicit one-model download. No user media or API keys are sent."""
import argparse
import hashlib
import json
from pathlib import Path
import time
import sys
from uuid import uuid4
if __package__ in (None,''):
    sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
from backend.lock import data_lock

REPO = 'Systran/faster-whisper-small'
REVISION = '536b0662742c02347bc0e980a01041f333bce120'
WEIGHT_SHA256 = '3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671'
FILES = ('model.bin','config.json','tokenizer.json','vocabulary.txt')


def valid_model(directory):
    if directory.is_symlink() or not all((directory/name).is_file() and not (directory/name).is_symlink() for name in FILES):
        return False
    return weight_matches(directory)


def weight_matches(directory):
    if (directory/'model.bin').is_symlink():return False
    with (directory/'model.bin').open('rb') as weights:
        return hashlib.file_digest(weights,'sha256').hexdigest()==WEIGHT_SHA256


def install(output, emit=lambda **event:None):
    output=Path(output).absolute()
    emit(state='checking')
    with data_lock(output.with_name(output.name+'.install-lock')):
        if valid_model(output):
            emit(state='ready');return
        stage=output.with_name(output.name+'.download')
        if output.is_symlink() or stage.is_symlink():raise OSError('Unexpected model symlink')
        from huggingface_hub import snapshot_download
        from tqdm.auto import tqdm
        class Progress(tqdm):
            def update(self,n=1):
                result=super().update(n)
                if self.unit=='B' and self.total and time.monotonic()-getattr(self,'_reported_at',0)>.5:
                    self._reported_at=time.monotonic()
                    emit(state='downloading',downloaded=int(self.n),total=int(self.total))
                return result
        emit(state='downloading')
        snapshot_download(REPO,revision=REVISION,endpoint='https://huggingface.co',token=False,
            local_dir=str(stage),max_workers=2,tqdm_class=Progress,
            force_download=(stage/'model.bin').is_file() and not weight_matches(stage),
            allow_patterns=[*FILES,'README.md'])
        emit(state='verifying')
        if not valid_model(stage):raise ValueError('Model checksum mismatch')
        (stage/'MODEL_INFO.json').write_text(json.dumps(dict(repo=REPO,revision=REVISION,
            license='MIT',model_sha256=WEIGHT_SHA256),indent=2),encoding='utf-8')
        backup=None
        if output.exists():
            backup=output.with_name(output.name+'.previous-'+uuid4().hex[:8]);output.rename(backup)
        try:stage.rename(output)
        except OSError:
            if backup:backup.rename(output)
            raise
        emit(state='ready')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent.parent/'models/faster-whisper-small')
    parser.add_argument('--events',action='store_true',help='Structured installation status for the desktop parent')
    args = parser.parse_args()
    emit=(lambda **event:print(json.dumps(event),flush=True)) if args.events else (lambda **event:None)
    install(args.output,emit)
    if not args.events:print('Verified model:', REPO, REVISION, '; MIT; no other model downloaded')


if __name__ == '__main__':
    main()
