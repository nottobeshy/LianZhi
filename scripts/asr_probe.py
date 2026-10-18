"""Local CPU ASR validation; never downloads models or sends user media."""
import argparse
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.services.asr import transcribe, ASRError


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--video', type=Path, required=True)
    parser.add_argument('--model-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True, help='New private JSON file; never overwrites an existing result')
    args = parser.parse_args()
    if args.output.exists():
        parser.error('输出已存在，请选用新的隔离输出文件。')
    try:
        result = transcribe(args.video.resolve(), args.model_dir.resolve())
        with args.output.open('x', encoding='utf-8') as output:
            json.dump(result, output, ensure_ascii=False, indent=2)
        print(json.dumps({k:result[k] for k in ('engine', 'model', 'device', 'compute_type', 'duration', 'elapsed_seconds')}, ensure_ascii=False))
        print('segments:', len(result['segments']), '; private result saved; no network request')
    except (ASRError, ValueError, OSError) as exc:
        parser.exit(1, str(exc)+'\n')
    except ImportError:
        parser.exit(1, '本地ASR依赖未安装，请先安装requirements-asr.txt。\n')


if __name__ == '__main__':
    main()
