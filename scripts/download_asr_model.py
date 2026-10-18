"""Explicit one-model download. No user media or API keys are sent."""
import argparse
import hashlib
import json
from pathlib import Path

REPO = 'Systran/faster-whisper-small'
REVISION = '536b0662742c02347bc0e980a01041f333bce120'
WEIGHT_SHA256 = '3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent.parent/'models/faster-whisper-small')
    args = parser.parse_args()
    from huggingface_hub import snapshot_download
    snapshot_download(REPO, revision=REVISION, endpoint='https://huggingface.co', token=False,
                      local_dir=str(args.output), max_workers=2,
                      allow_patterns=['model.bin', 'config.json', 'tokenizer.json', 'vocabulary.txt', 'README.md'])
    with (args.output/'model.bin').open('rb') as weights:
        digest = hashlib.file_digest(weights, 'sha256').hexdigest()
    if digest != WEIGHT_SHA256:
        parser.exit(1, 'Model checksum mismatch; do not use this download.\n')
    (args.output/'MODEL_INFO.json').write_text(json.dumps(dict(repo=REPO, revision=REVISION,
        license='MIT', model_sha256=digest), indent=2), encoding='utf-8')
    print('Verified model:', REPO, REVISION, '; MIT; no other model downloaded')


if __name__ == '__main__':
    main()
