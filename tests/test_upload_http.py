"""Real HTTP upload limits, generated MP4 only; no model or private media required."""
import json
import socket
import struct
import time
from urllib.parse import urlsplit

import httpx
import pytest

from tests.test_process import server
from tests.test_video import make_mp4


def padded_mp4(source, size):
    # A valid MP4 free box gives exact, reproducible sizes without private footage.
    padding = size - len(source)
    assert padding >= 8
    return source + struct.pack('>I4s', padding, b'free') + bytes(padding - 8)


def headers(request_id):
    return {'Content-Type': 'video/mp4', 'X-File-Name': 'generated.mp4', 'X-Request-Id': request_id}


def test_upload_http_boundaries_and_json_protection(tmp_path):
    source = make_mp4(tmp_path / 'generated.mp4')
    evidence = []
    with server(tmp_path / 'data', log_path=tmp_path / 'http.log') as base:
        with httpx.Client(base_url=base, trust_env=False, timeout=30) as client:
            for path in ('/api/videos', '/api/videos/'):
                for size in (32768, 64512, 65536, 65537, 66560, 131072, 1048576):
                    body = padded_mp4(source, size)
                    response = client.post(path, content=body, headers=headers(f'{len(path)}-{size}'))
                    evidence.append(dict(path=path, file_bytes=size, body_bytes=len(body), status=response.status_code))
                    assert response.status_code == 201, response.text
                    assert response.json()['size'] == size
                    assert response.json()['state'] == 'uploaded'
                    # Identical retry must not create another record.
                    retry = client.post(path, content=body, headers=headers(f'{len(path)}-{size}'))
                    assert retry.status_code == 201 and retry.json()['id'] == response.json()['id']
                denied = client.post('/api/videos/not-an-upload/transcript', content=b'x' * 65537)
                assert denied.status_code == 413 and denied.json()['error']['code'] == 'INPUT_LIMIT'
                blocked = client.post(path, content=b'x' * 65537,
                                      headers={**headers('cross-origin'), 'Origin': 'https://evil.test'})
                assert blocked.status_code == 403
            assert len(client.get('/api/videos').json()['items']) == 14
            assert client.post('/api/challenges', content=b'x' * 65537).status_code == 413
    assert not list((tmp_path / 'data/videos').glob('*.upload.mp4'))
    assert (tmp_path / 'http.log').read_text() == ''
    (tmp_path / 'boundary-evidence.json').write_text(json.dumps(evidence, indent=2), encoding='utf-8')


@pytest.mark.parametrize('path', ['/api/videos', '/api/videos/'])
def test_upload_http_actual_limit_invalid_and_interrupted(tmp_path, path):
    source = make_mp4(tmp_path / 'generated.mp4')
    limit = 100 * 1024 * 1024
    with server(tmp_path / 'data') as base:
        with httpx.Client(base_url=base, trust_env=False, timeout=60) as client:
            # Actual chunked transfer, no Content-Length; do not allocate 100MiB at once.
            def oversized():
                chunk = bytes(1024 * 1024)
                for _ in range(100):
                    yield chunk
                yield b'x'
            response = client.post(path, content=oversized(), headers=headers('too-large'))
            assert response.status_code == 413 and response.json()['error']['code'] == 'FILE_TOO_LARGE'
            for body, expected in ((b'', 'EMPTY_FILE'), (b'invalid mp4', 'UNSUPPORTED_MEDIA')):
                response = client.post(path, content=body, headers=headers(expected))
                assert response.status_code == (400 if not body else 422)
                assert response.json()['error']['code'] == expected
            assert client.post(path, files={'file': ('sample.mp4', source, 'video/mp4')}).status_code == 415
            response = client.post(path, content=make_mp4(tmp_path / 'no-audio.mp4', audio=False), headers=headers('silent'))
            assert response.status_code == 422 and response.json()['error']['code'] == 'NO_AUDIO'

            # Disconnect after the temporary file exists, then verify cleanup and lock release.
            url = urlsplit(base)
            with socket.create_connection((url.hostname, url.port), timeout=5) as connection:
                request = (f'POST {path} HTTP/1.1\r\nHost: {url.netloc}\r\nContent-Type: video/mp4\r\n'
                           f'X-File-Name: generated.mp4\r\nX-Request-Id: interrupted\r\nContent-Length: {limit}\r\n\r\n')
                connection.sendall(request.encode('ascii') + source)
                for _ in range(100):
                    if list((tmp_path / 'data/videos').glob('*.upload.mp4')):
                        break
                    time.sleep(.02)
                else:
                    pytest.fail('Upload did not start')
            for _ in range(100):
                if not list((tmp_path / 'data/videos').glob('*.upload.mp4')):
                    break
                time.sleep(.02)
            assert not list((tmp_path / 'data/videos').glob('*.upload.mp4'))
            assert client.get('/api/videos').json()['items'] == []
            assert client.post(path, content=source, headers=headers('after-interruption')).status_code == 201
            def maximum():
                yield source
                padding = limit - len(source)
                yield struct.pack('>I4s', padding, b'free')
                remaining, chunk = padding - 8, bytes(1024 * 1024)
                while remaining:
                    length = min(remaining, len(chunk))
                    yield chunk[:length]
                    remaining -= length
            accepted = client.post(path, content=maximum(), headers=headers('exact-maximum'))
            assert accepted.status_code == 201 and accepted.json()['size'] == limit
