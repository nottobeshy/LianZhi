"""Windows offline Chinese speech MP4 for upload/ASR acceptance; no private footage."""
import argparse
from fractions import Fraction
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

import av
import numpy as np


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path('.test-runtime/upload-browser/public-speech.mp4'))
    output = parser.parse_args().output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        parser.error('Output already exists; choose a new path.')
    text = '这是炼知的视频上传测试。抛一枚公平的硬币，正面和反面的概率都是二分之一。连续抛两次，至少出现一次正面的概率是四分之三。这个结论需要公平和独立两个前提。'
    with TemporaryDirectory(dir=output.parent, prefix='speech-') as temporary:
        assert Path(temporary).resolve().parent == output.parent
        wave = Path(temporary)/'speech.wav'
        command = ("Add-Type -AssemblyName System.Speech; "
                   "$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
                   "try { $speaker.SelectVoice('Microsoft Huihui Desktop'); "
                   "$speaker.SetOutputToWaveFile('"+str(wave).replace("'", "''")+"'); "
                   "$speaker.Speak('"+text+"') } finally { $speaker.Dispose() }")
        subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', command], check=True)
        with av.open(str(wave)) as source, av.open(str(output), 'w', format='mp4') as target:
            duration = source.duration / av.time_base
            video = target.add_stream('libx264', rate=10)
            video.width, video.height, video.pix_fmt = 320, 180, 'yuv420p'
            audio = target.add_stream('aac', rate=16000)
            audio.layout = 'mono'
            for i in range(int(duration*10)+1):
                pixels = np.zeros((180, 320, 3), dtype=np.uint8)
                pixels[:, :, 1] = 60
                frame = av.VideoFrame.from_ndarray(pixels, format='rgb24')
                frame.pts, frame.time_base = i, Fraction(1, 10)
                for packet in video.encode(frame):
                    target.mux(packet)
            for packet in video.encode():
                target.mux(packet)
            resampler = av.AudioResampler(format='fltp', layout='mono', rate=16000)
            for frame in source.decode(audio=0):
                for resampled in resampler.resample(frame):
                    for packet in audio.encode(resampled):
                        target.mux(packet)
            for frame in resampler.resample(None):
                for packet in audio.encode(frame):
                    target.mux(packet)
            for packet in audio.encode():
                target.mux(packet)
    print(f'Generated H.264/AAC MP4: {output.stat().st_size} bytes, {duration:.2f} seconds')


if __name__ == '__main__':
    main()
