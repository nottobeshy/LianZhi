"""Validated local CPU ASR adapter; no implicit downloads or network requests."""
import hashlib
import json
import math
from pathlib import Path
import time

MODEL_REPO = 'Systran/faster-whisper-small'
MODEL_REVISION = '536b0662742c02347bc0e980a01041f333bce120'
MAX_BYTES = 100 * 1024 * 1024
MAX_SECONDS = 180


class ASRError(Exception):
    def __init__(self, code, message):
        self.code, self.message = code, message
        super().__init__(message)


def probe_media(video):
    import av
    if not video.is_file() or video.suffix.lower() != '.mp4':
        raise ASRError('UNSUPPORTED_MEDIA', '请选择本机 MP4 视频文件。')
    if not 0 < video.stat().st_size <= MAX_BYTES:
        raise ASRError('FILE_TOO_LARGE', '视频必须大于0且不超过100 MiB。')
    with video.open('rb') as source:
        header = source.read(64)
    if len(header) < 12 or header[4:8] != b'ftyp' or header[8:12] == b'qt  ':
        raise ASRError('UNSUPPORTED_MEDIA', '文件实际内容不是支持的 MP4。')
    with av.open(str(video), options={'enable_drefs':'0', 'use_absolute_path':'0', 'protocol_whitelist':'file'}) as media:
        if 'mp4' not in media.format.name.split(',') or not media.streams.video:
            raise ASRError('UNSUPPORTED_MEDIA', '文件实际内容不是支持的 MP4 视频。')
        if not media.streams.audio:
            raise ASRError('NO_AUDIO', '视频没有音轨，请选择包含普通话口播的视频。')
        duration = (media.duration or 0) / av.time_base
        if not math.isfinite(duration) or not 0 < duration <= MAX_SECONDS:
            raise ASRError('DURATION_LIMIT', '视频须有有效时长且不超过180秒。')
        track = media.streams.audio[0]
        offset = float((track.start_time or 0) * (track.time_base or 0))
        if offset < 0 or offset > duration:
            raise ASRError('MEDIA_TIMELINE', '音轨起始时间不支持；请先导出从零开始的普通MP4。')
        if next(media.decode(video=0), None) is None:
            raise ASRError('DECODE_ERROR', '视频帧无法解码。')
        return dict(duration=duration, audio_offset=offset, container='MP4', audio_codec=track.codec_context.name)


def peak_rss_mib():
    import sys
    if sys.platform != 'win32':
        return None
    import ctypes
    from ctypes import wintypes
    class Counters(ctypes.Structure):
        _fields_ = [('cb', wintypes.DWORD), ('PageFaultCount', wintypes.DWORD)] + [
            (name, ctypes.c_size_t) for name in ('PeakWorkingSetSize', 'WorkingSetSize',
            'QuotaPeakPagedPoolUsage', 'QuotaPagedPoolUsage', 'QuotaPeakNonPagedPoolUsage',
            'QuotaNonPagedPoolUsage', 'PagefileUsage', 'PeakPagefileUsage')]
    kernel = ctypes.WinDLL('kernel32')
    kernel.GetCurrentProcess.restype = wintypes.HANDLE
    query = ctypes.WinDLL('psapi').GetProcessMemoryInfo
    query.argtypes = [wintypes.HANDLE, ctypes.POINTER(Counters), wintypes.DWORD]
    counters = Counters()
    if query(kernel.GetCurrentProcess(), ctypes.byref(counters), ctypes.sizeof(counters)):
        return round(counters.PeakWorkingSetSize / 1048576, 1)
    return None


def transcribe(video, model_dir):
    from faster_whisper import WhisperModel
    from importlib.metadata import version

    metadata = probe_media(video)
    for name in ('model.bin', 'config.json', 'tokenizer.json', 'vocabulary.txt'):
        if not (model_dir / name).is_file():
            raise ASRError('MODEL_NOT_INSTALLED', '本地模型文件不完整；应用不会自动下载模型。')
    with (model_dir/'model.bin').open('rb') as weights:
        if hashlib.file_digest(weights, 'sha256').hexdigest() != '3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671':
            raise ASRError('MODEL_CHECKSUM', '模型权重校验不符，请按固定版本重新准备模型。')
    duration, offset = metadata['duration'], metadata['audio_offset']
    started = time.perf_counter()
    model = WhisperModel(str(model_dir), device='cpu', compute_type='int8', cpu_threads=4,
                         num_workers=1, local_files_only=True)
    segments, _ = model.transcribe(str(video), language='zh', beam_size=5,
                                   vad_filter=True, condition_on_previous_text=False)
    result, previous_end = [], 0.0
    for segment in segments:
        text = segment.text.strip()
        if not text:
            continue
        start, end = round(segment.start + offset, 3), round(segment.end + offset, 3)
        if not all(math.isfinite(x) for x in (start, end)) or start < previous_end or not start < end <= duration + .1:
            raise ASRError('INVALID_TRANSCRIPT', 'ASR时间戳超出视频范围或顺序异常，请检查媒体时间轴。')
        result.append(dict(segment_id='s'+str(len(result)+1), start=start, end=min(end, duration), text=text))
        previous_end = end
    if not result:
        raise ASRError('NO_SPEECH', '没有识别到有效语音；不会用演示文本替代。')
    return dict(engine='faster-whisper', engine_version=version('faster-whisper'),
                model=MODEL_REPO, model_revision=MODEL_REVISION, language='zh', device='cpu', compute_type='int8',
                duration=duration, elapsed_seconds=round(time.perf_counter()-started, 3),
                source_sha256=hashlib.sha256(video.read_bytes()).hexdigest(), peak_process_rss_mib=peak_rss_mib(), segments=result)
