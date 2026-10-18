"""Video AI suggestions bound to immutable user-confirmed transcript snapshots."""
import json
from uuid import uuid4

from .db import Problem, encode, fingerprint, now
from .prompts.video_review import PROMPT_VERSION


class ReviewRepository:
    def __init__(self, videos):
        self.videos, self.database = videos, videos.database

    def _view(self, data, con):
        view = {k:v for k,v in data.items() if k != 'fingerprint'}
        view['stale'] = self.videos.get(data['video_id'], con)['confirmed_version_id'] != data['transcript_version_id']
        return view

    def get(self, video_id, review_id, con=None):
        if con is None:
            with self.database.connect() as connection:
                return self.get(video_id, review_id, connection)
        row = con.execute('SELECT data FROM video_reviews WHERE id=? AND video_id=?', (review_id, video_id)).fetchone()
        if not row:
            raise Problem('NOT_FOUND', '未找到这段视频的复盘记录。', 404)
        return self._view(json.loads(row['data']), con)

    def list(self, video_id):
        with self.database.connect() as con:
            self.videos.get(video_id, con)
            return [self._view(json.loads(row['data']), con) for row in con.execute(
                'SELECT data FROM video_reviews WHERE video_id=? ORDER BY rowid DESC LIMIT 100', (video_id,))]

    def replay(self, video_id, payload):
        with self.database.connect() as con:
            row = con.execute('SELECT data FROM video_reviews WHERE request_id=?', (payload['request_id'],)).fetchone()
            if not row:
                return None
            data = json.loads(row['data'])
            if data['fingerprint'] != fingerprint({'video_id':video_id, **payload}):
                raise Problem('REQUEST_CONFLICT', '请求编号已用于其他视频、版本或内容。', 409)
            if data['state'] != 'succeeded':
                raise Problem('BUSY' if data['state']=='running' else 'REVIEW_FAILED',
                              '该复盘正在进行或此前已失败；请先查看记录，失败后须主动发起新请求。', 409)
            return self._view(data, con)

    def reserve(self, video_id, payload):
        with self.database.connect() as con:
            con.execute('BEGIN IMMEDIATE')
            video = self.videos.get(video_id, con)
            if video['revision'] != payload['expected_revision']:
                raise Problem('STALE_INPUT', '转写记录已变化，请重新读取并确认。', 409)
            version_id = video['confirmed_version_id']
            if not version_id or version_id != payload['transcript_version_id']:
                raise Problem('TRANSCRIPT_NOT_CONFIRMED', '请先确认当前转写文案，不能复盘未确认或过期版本。', 409)
            snapshot = next((v for v in video['versions'] if v['version_id']==version_id), None)
            if snapshot is None:
                raise Problem('TRANSCRIPT_NOT_CONFIRMED', '确认稿不存在，请重新核对转写。', 409)
            data = dict(id=str(uuid4()), video_id=video_id, transcript_version_id=version_id,
                        request_id=payload['request_id'], fingerprint=fingerprint({'video_id':video_id, **payload}),
                        original_script='\n'.join(s['text'] for s in snapshot['segments']),
                        original_segments=snapshot['segments'], prompt_version=PROMPT_VERSION,
                        state='running', error=None, ai_script=None, user_script=None, edits=[], revision=1,
                        change_summary=[], needs_verification=[], origin=None, created_at=now())
            con.execute('INSERT INTO video_reviews VALUES(?,?,?,?)', (data['id'], payload['request_id'], video_id, encode(data)))
            return data

    def finish(self, snapshot, result=None, origin=None, error=None):
        with self.database.connect() as con:
            snapshot.update(state='failed' if error else 'succeeded', error=error, completed_at=now())
            if result:
                snapshot.update(ai_script=result['revised_script'], change_summary=result['change_summary'],
                                needs_verification=result['needs_verification'], origin=origin)
            con.execute('UPDATE video_reviews SET data=? WHERE id=?', (encode(snapshot), snapshot['id']))
            return self._view(snapshot, con)

    def save_script(self, video_id, review_id, payload):
        with self.database.connect() as con:
            con.execute('BEGIN IMMEDIATE')
            data = self.get(video_id, review_id, con)
            if data['state'] != 'succeeded':
                raise Problem('INVALID_STAGE', '只有成功的AI建议可以编辑保存。', 409)
            for old in data['edits']:
                if old['request_id'] == payload['request_id']:
                    if old['fingerprint'] != fingerprint(payload):
                        raise Problem('REQUEST_CONFLICT', '保存请求编号对应了不同内容。', 409)
                    return data
            if data['revision'] != payload['expected_revision']:
                raise Problem('STALE_INPUT', '建议稿已被更新，编辑已保留，请重新读取后核对。', 409)
            data.update(user_script=payload['text'], revision=data['revision']+1)
            data['edits'].append(dict(request_id=payload['request_id'], fingerprint=fingerprint(payload),
                                      text=payload['text'], created_at=now()))
            # Restore internal fingerprint; never persist the computed stale flag.
            stored = json.loads(con.execute('SELECT data FROM video_reviews WHERE id=?', (review_id,)).fetchone()['data'])
            data['fingerprint'] = stored['fingerprint']
            data.pop('stale', None)
            con.execute('UPDATE video_reviews SET data=? WHERE id=?', (encode(data), review_id))
            return self._view(data, con)
