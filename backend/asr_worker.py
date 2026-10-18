"""Private subprocess entry point. Decode/infer only; no server or credential import."""
import argparse
import json
import os
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--video', type=Path, required=True)
    parser.add_argument('--model-dir', type=Path)
    parser.add_argument('--probe-only', action='store_true')
    args = parser.parse_args()
    os.environ['HF_HUB_OFFLINE'] = '1'
    os.environ['TRANSFORMERS_OFFLINE'] = '1'
    from .services.asr import ASRError, probe_media, transcribe
    try:
        result = probe_media(args.video) if args.probe_only else transcribe(args.video, args.model_dir)
        print(json.dumps({'result':result}, ensure_ascii=True))
    except ASRError as exc:
        print(json.dumps({'error':{'code':exc.code, 'message':exc.message}}, ensure_ascii=True))
    except ImportError:
        print(json.dumps({'error':{'code':'ASR_NOT_INSTALLED', 'message':'本地解码/ASR依赖未安装，请按ASR复现说明安装。'}}, ensure_ascii=True))
    except OSError:
        print(json.dumps({'error':{'code':'DECODE_ERROR', 'message':'媒体读取或解码失败，请检查文件和目录权限。'}}, ensure_ascii=True))
    except Exception as exc:
        import av
        decoding = isinstance(exc, av.error.FFmpegError) or args.probe_only
        print(json.dumps({'error':{'code':'DECODE_ERROR' if decoding else 'ASR_ERROR',
            'message':'媒体音视频解码失败，请换用正常MP4。' if decoding else '本地ASR推理失败，原视频和已保存记录保留；未使用Mock替代。'}}, ensure_ascii=True))


if __name__ == '__main__':
    main()
