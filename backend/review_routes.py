from .db import Problem
from .review_db import ReviewRepository
from .schemas import ReviewVideo, SaveReviewScript


def add_review_routes(app, videos, llm):
    repository = ReviewRepository(videos.repository)
    app.state.reviews = repository

    @app.get('/api/videos/{video_id}/reviews')
    def list_reviews(video_id: str):
        return {'items':repository.list(video_id)}

    @app.post('/api/videos/{video_id}/review')
    def review_video(video_id: str, body: ReviewVideo):
        if not body.consent:
            raise Problem('CONSENT_REQUIRED', '请明确同意将确认后的文案发送到当前模型服务。', 403)
        if not llm.lock.acquire(blocking=False):
            raise Problem('BUSY', '模型请求正在执行，请等待完成。', 409)
        snapshot = None
        try:
            payload = body.model_dump()
            old = repository.replay(video_id, payload)
            if old:
                return old
            snapshot = repository.reserve(video_id, payload)
            llm.ready()
            result, origin = llm.review_video(snapshot)
            return repository.finish(snapshot, result, origin)
        except Problem as exc:
            if snapshot:
                repository.finish(snapshot, error={'code':exc.code, 'message':exc.message})
            raise
        except Exception:
            if snapshot:
                repository.finish(snapshot, error={'code':'REVIEW_ERROR', 'message':'复盘未完成或结果未能保存；原文保留，未自动重试。'})
            raise
        finally:
            llm.lock.release()

    @app.post('/api/videos/{video_id}/reviews/{review_id}/script')
    def save_script(video_id: str, review_id: str, body: SaveReviewScript):
        return repository.save_script(video_id, review_id, body.model_dump())
