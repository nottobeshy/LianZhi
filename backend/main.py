import sqlite3
from contextlib import asynccontextmanager
from urllib.parse import urlsplit
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException
from .config import Config, ROOT
from .db import Database, Problem
from .schemas import CreateChallenge, AskQuestions, SubmitAnswers, SubmitRevision, LLMSettings
from .services.llm import LLMService
from .lock import data_lock
from .db import now


def failure(code, message, status):
    return JSONResponse({'error': {'code': code, 'message': message}}, status_code=status)


def create_app(config=None, llm=None):
    config = config or Config()
    db = Database(config.data_dir)
    llm = llm or LLMService(config)

    @asynccontextmanager
    async def lifespan(app):
        with data_lock(config.data_dir):
            db.initialize()
            yield

    app = FastAPI(title='炼知 LianZhi', version='1.0.0', lifespan=lifespan)
    app.state.db = db
    app.state.config = config
    app.state.llm = llm

    @app.exception_handler(Problem)
    async def problem_handler(request, exc):
        return failure(exc.code, exc.message, exc.status)

    @app.exception_handler(RequestValidationError)
    async def validation_handler(request, exc):
        # Do not echo submitted texts, API keys, or validation input in errors.
        return failure('INPUT_LIMIT', '请求字段、类型或长度不合法，请检查输入。', 422)

    @app.exception_handler(sqlite3.Error)
    async def storage_handler(request, exc):
        return failure('STORAGE_ERROR', '本地记录未保存，请检查数据目录权限或可用空间。', 503)

    @app.exception_handler(HTTPException)
    async def http_handler(request, exc):
        return failure('HTTP_ERROR', '接口或资源不存在，或请求方式不支持。', exc.status_code)

    @app.exception_handler(Exception)
    async def unexpected_handler(request, exc):
        return failure('INTERNAL_ERROR', '本次操作失败，输入请保留，稍后重试。', 500)

    @app.middleware('http')
    async def local_only(request: Request, call_next):
        host = request.url.hostname
        if host not in ('127.0.0.1', 'localhost', 'testserver'):
            return failure('HOST_DENIED', '仅允许本机地址访问。', 403)
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            origin = request.headers.get('origin')
            if request.headers.get('sec-fetch-site') == 'cross-site' or (origin and origin != f'{request.url.scheme}://{request.url.netloc}'):
                return failure('ORIGIN_DENIED', '拒绝跨站写入请求。', 403)
            chunks, size = [], 0
            async for chunk in request.stream():
                size += len(chunk)
                if size > 65536:
                    return failure('INPUT_LIMIT', '请求超过 64 KiB。', 413)
                chunks.append(chunk)
            request._body = b''.join(chunks)
        response = await call_next(request)
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response

    @app.get('/api/health')
    def health():
        return {'status': 'ok', 'app': 'LianZhi', 'database': 'ready', 'asr': 'not_implemented', 'llm': llm.status()}

    @app.post('/api/challenges', status_code=201)
    def create(body: CreateChallenge):
        return db.create(body.model_dump())

    @app.get('/api/challenges')
    def list_challenges():
        return {'items': db.list()}

    @app.get('/api/challenges/{challenge_id}')
    def get_challenge(challenge_id: str):
        return db.get(challenge_id)

    @app.get('/api/settings/llm')
    def llm_status():
        return llm.status()

    @app.post('/api/settings/llm')
    def llm_settings(body: LLMSettings):
        return llm.settings(body)

    @app.delete('/api/settings/llm')
    def clear_key():
        if not llm.lock.acquire(blocking=False):
            raise Problem('BUSY', '模型请求运行中。', 409)
        try:
            config.api_key = ''
        finally:
            llm.lock.release()
        return llm.status()

    @app.post('/api/challenges/{challenge_id}/questions')
    def questions(challenge_id: str, body: AskQuestions):
        if not body.consent:
            raise Problem('CONSENT_REQUIRED', '请先明确同意将解释文字发送至所选模型。', 403)
        if not llm.lock.acquire(blocking=False):
            raise Problem('BUSY', '模型请求正在执行，请等待。', 409)
        reserved = False
        try:
            record = db.get(challenge_id)
            llm.ready()
            payload = body.model_dump()
            old = db.reserve_questions(challenge_id, payload)
            if old:
                return old
            reserved = True
            if record['revision'] != body.expected_revision or record['questions']:
                raise Problem('STALE_INPUT', '该解释已生成追问或记录已变化，请重新读取。', 409)
            result, origin = llm.ask(record)
            def assign(data):
                data['questions'] = {**result, 'origin': origin}
                data['stage'] = 'questioned'
            saved = db.change(challenge_id, 'questions', payload, assign)
            db.finish_job(body.request_id)
            return saved
        except Problem as exc:
            if reserved:
                db.finish_job(body.request_id, exc.code)
            raise
        except Exception:
            if reserved:
                db.finish_job(body.request_id, 'INTERNAL_ERROR')
            raise
        finally:
            llm.lock.release()

    @app.post('/api/challenges/{challenge_id}/answers')
    def answers(challenge_id: str, body: SubmitAnswers):
        def assign(data):
            if not data['questions'] or data['answers']:
                raise Problem('INVALID_STAGE', '请先生成追问；已提交回答不可被覆盖。', 409)
            expected = {q['question_id'] for q in data['questions']['questions']}
            if {a.question_id for a in body.answers} != expected or len(body.answers) != len(expected):
                raise Problem('INVALID_ANSWERS', '每个问题必须回答或明确跳过，题号不能重复。')
            if any((a.state == 'answered' and a.text is None) or (a.state == 'skipped' and a.text is not None) for a in body.answers):
                raise Problem('INVALID_ANSWERS', '回答须非空；跳过时文本须为空。')
            data['answers'] = [a.model_dump() for a in body.answers]
            data['stage'] = 'answered'
        return db.change(challenge_id, 'answers', body.model_dump(), assign)

    @app.post('/api/challenges/{challenge_id}/revisions')
    def revision(challenge_id: str, body: SubmitRevision):
        def assign(data):
            if not data['answers']:
                raise Problem('INVALID_STAGE', '请先提交回答或明确跳过。', 409)
            data['revisions'].append({'version': len(data['revisions']) + 1, 'text': body.text, 'created_at': now()})
            data['stage'] = 'revised'
        return db.change(challenge_id, 'revision', body.model_dump(), assign)

    @app.delete('/api/challenges/{challenge_id}', status_code=204)
    def delete_challenge(challenge_id: str):
        db.delete(challenge_id)

    @app.get('/api/examples')
    def examples():
        return {'items': [{'id': 'coin-protocol-v1', 'mode': 'example', 'title': '两次抛硬币的学习案例',
                 'source': 'docs/03 第7节协议夹具，由项目预存；非真实 API 运行记录',
                 'explanation': '至少一个正面的概率是二分之一，因为有正面或没有正面只有两种情况。',
                 'questions': ['请列出两次抛掷的基本结果，并说明为什么它们等可能。'],
                 'answer': '正正、正反、反正、反反；假设硬币公平、两次独立。',
                 'revision': '在公平且独立的前提下，四个等可能结果中三个至少出现一次正面，所以是3/4。',
                 'limitations': '只说明学习流程，不证明掌握；未执行事实核查或模型调用。'}]}

    @app.get('/api/{unknown:path}', include_in_schema=False)
    def missing_api(unknown: str):
        raise Problem('NOT_FOUND', '接口不存在。', 404)

    app.mount('/', StaticFiles(directory=ROOT / 'demo', html=True), name='frontend')
    return app


app = create_app()
