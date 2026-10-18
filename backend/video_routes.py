import asyncio
import hashlib
import re
from urllib.parse import unquote
from uuid import uuid4
from fastapi import Request
from fastapi.responses import FileResponse
from starlette.concurrency import run_in_threadpool
from starlette.requests import ClientDisconnect
from .db import Problem
from .schemas import Command, SaveTranscript
from .services.asr import MAX_BYTES


def add_video_routes(app, service):
    @app.get('/api/videos')
    def list_videos():
        return {'items':service.repository.list()}

    @app.post('/api/videos/', status_code=201, include_in_schema=False)
    @app.post('/api/videos', status_code=201)
    async def upload_video(request: Request):
        if request.headers.get('content-type', '').split(';')[0] != 'video/mp4':
            raise Problem('UNSUPPORTED_MEDIA', '上传只接受MP4视频。', 415)
        request_id = request.headers.get('x-request-id', '')
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,80}', request_id):
            raise Problem('INPUT_LIMIT', '上传需要有效的请求编号。')
        try:
            name = unquote(request.headers.get('x-file-name', ''), errors='strict')
        except (UnicodeError, ValueError):
            raise Problem('INPUT_LIMIT', '文件名编码不合法。') from None
        if (not 1 <= len(name) <= 180 or '/' in name or '\\' in name or ':' in name
                or any(ord(c)<32 for c in name) or not name.lower().endswith('.mp4')):
            raise Problem('UNSUPPORTED_MEDIA', '请选择文件名有效的MP4；文件名不可含路径。')
        declared = request.headers.get('content-length')
        if declared and (not declared.isdigit() or int(declared) > MAX_BYTES):
            raise Problem('FILE_TOO_LARGE', '视频不能超过100 MiB。', 413)
        if not service.upload_lock.acquire(blocking=False):
            raise Problem('BUSY', '另一个视频正在上传/校验，请稍后重试。', 409)
        video_id = str(uuid4())
        target = service.media_path(video_id)
        temporary = target.with_name(video_id+'.upload.mp4')
        committed, moved = False, False
        try:
            size, digest = 0, hashlib.sha256()
            async with asyncio.timeout(60):
                with temporary.open('xb') as output:
                    async for chunk in request.stream():
                        size += len(chunk)
                        if size > MAX_BYTES:
                            raise Problem('FILE_TOO_LARGE', '视频不能超过100 MiB。', 413)
                        output.write(chunk)
                        digest.update(chunk)
            if not size:
                raise Problem('EMPTY_FILE', '请选择非空视频文件。')
            if declared and size != int(declared):
                raise Problem('UPLOAD_INCOMPLETE', '上传不完整，请重新选择原视频。')
            payload = dict(name=name,size=size,sha256=digest.hexdigest())
            old = service.repository.upload_replay(request_id, payload)
            if old:
                return old
            metadata = await run_in_threadpool(service.run_worker, temporary, True)
            if target.exists():
                raise Problem('STORAGE_ERROR', '生成的媒体文件名已存在，请重新上传。', 503)
            temporary.rename(target)
            moved = True
            record = service.repository.create(video_id, request_id, payload, metadata)
            committed = True
            return record
        except TimeoutError:
            raise Problem('UPLOAD_TIMEOUT', '上传超时，请检查本机文件后重试。', 408) from None
        except ClientDisconnect:
            raise Problem('UPLOAD_INTERRUPTED', '上传连接中断，请重新选择原视频。', 400) from None
        except Problem as exc:
            if exc.code in ('NO_AUDIO','UNSUPPORTED_MEDIA','DURATION_LIMIT','DECODE_ERROR','MEDIA_TIMELINE'):
                raise Problem(exc.code, exc.message, 422) from None
            raise
        except OSError:
            raise Problem('STORAGE_ERROR', '视频未保存，请检查数据目录权限或磁盘空间。', 503) from None
        finally:
            try:
                temporary.unlink(missing_ok=True)
                if moved and not committed:
                    target.unlink(missing_ok=True)
            except OSError:
                # Preserve the original storage error; never delete anything outside this generated upload.
                pass
            finally:
                service.upload_lock.release()

    @app.get('/api/videos/{video_id}')
    def get_video(video_id: str):
        return service.get(video_id)

    @app.get('/api/videos/{video_id}/media')
    def get_media(video_id: str):
        data = service.repository.get(video_id)
        path = service.media_path(video_id)
        if not path.is_file():
            raise Problem('MEDIA_MISSING', '本地视频文件已丢失，转写文字记录仍保留。', 404)
        return FileResponse(path, media_type='video/mp4', filename=data['name'], content_disposition_type='inline')

    @app.post('/api/videos/{video_id}/transcribe', status_code=202)
    def start_transcribe(video_id: str, body: Command):
        return service.start(video_id, body.model_dump())

    @app.post('/api/videos/{video_id}/transcript')
    def save_transcript(video_id: str, body: SaveTranscript):
        return service.repository.save(video_id, body.model_dump())
