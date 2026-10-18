"""Additive video records; immutable original ASR and confirmed transcript versions."""
import json
from uuid import uuid4
from .db import Problem, encode, fingerprint, now


class VideoRepository:
    def __init__(self, database):
        self.database = database

    def get(self, video_id, con=None):
        if con is None:
            with self.database.connect() as connection:
                return self.get(video_id, connection)
        row = con.execute('SELECT data FROM videos WHERE id=?', (video_id,)).fetchone()
        if not row:
            raise Problem('NOT_FOUND', '视频记录不存在。', 404)
        return json.loads(row['data'])

    def list(self):
        with self.database.connect() as con:
            return [json.loads(row['data']) for row in con.execute('SELECT data FROM videos ORDER BY rowid DESC LIMIT 100')]

    def upload_replay(self, request_id, payload):
        with self.database.connect() as con:
            row = con.execute('SELECT data,upload_fingerprint FROM videos WHERE upload_request_id=?', (request_id,)).fetchone()
            if row:
                if row['upload_fingerprint'] != fingerprint(payload):
                    raise Problem('REQUEST_CONFLICT', '上传请求编号对应了不同文件，请重新选择文件。', 409)
                return json.loads(row['data'])

    def create(self, video_id, request_id, payload, metadata):
        record = dict(id=video_id, name=payload['name'], size=payload['size'], sha256=payload['sha256'],
                      media_path='videos/'+video_id+'.mp4', metadata=metadata, state='uploaded', error=None,
                      raw_transcript=None, draft=[], versions=[], confirmed_version_id=None,
                      revision=1, created_at=now(), updated_at=now(), job_id=None)
        with self.database.connect() as con:
            con.execute('INSERT INTO videos VALUES(?,?,?,?)', (video_id, request_id, fingerprint(payload), encode(record)))
        return record

    def replay(self, video_id, kind, payload, con=None):
        if con is None:
            with self.database.connect() as connection:
                return self.replay(video_id, kind, payload, connection)
        command = {**payload, 'video_id':video_id}
        row = con.execute('SELECT * FROM video_commands WHERE request_id=?', (payload['request_id'],)).fetchone()
        if row:
            if row['video_id'] != video_id or row['kind'] != kind or row['fingerprint'] != fingerprint(command):
                raise Problem('REQUEST_CONFLICT', '请求编号已用于不同视频或内容。', 409)
            return json.loads(row['result'])

    def change(self, video_id, kind, payload, mutate):
        with self.database.connect() as con:
            con.execute('BEGIN IMMEDIATE')
            old = self.replay(video_id, kind, payload, con)
            if old:
                return old
            data = self.get(video_id, con)
            if data['revision'] != payload['expected_revision']:
                raise Problem('STALE_INPUT', '记录版本已变化；修改文字已保留，请重新读取后核对。', 409)
            mutate(data)
            data['revision'] += 1
            data['updated_at'] = now()
            con.execute('UPDATE videos SET data=? WHERE id=?', (encode(data), video_id))
            con.execute('INSERT INTO video_commands VALUES(?,?,?,?,?)', (payload['request_id'], video_id, kind,
                        fingerprint({**payload,'video_id':video_id}), encode(data)))
            return data

    def start(self, video_id, payload):
        def mutate(data):
            if data['raw_transcript'] or data['state'] == 'running':
                raise Problem('INVALID_STAGE', '该视频已转写或正在处理中，不重复覆盖原稿。', 409)
            data.update(state='running', error=None, job_id=payload['request_id'])
        return self.change(video_id, 'transcribe', payload, mutate)

    def finish(self, video_id, job_id, result=None, error=None):
        with self.database.connect() as con:
            con.execute('BEGIN IMMEDIATE')
            data = self.get(video_id, con)
            if data['job_id'] != job_id or data['state'] != 'running':
                return
            if error:
                data.update(state='interrupted' if error['code']=='INTERRUPTED' else 'failed', error=error)
            else:
                if result['source_sha256'] != data['sha256']:
                    raise Problem('INVALID_TRANSCRIPT', '转写结果与视频指纹不匹配。', 500)
                data.update(state='transcribed', error=None, raw_transcript={**result,'version_id':str(uuid4())},
                            draft=[dict(segment_id=s['segment_id'],text=s['text']) for s in result['segments']])
            data['revision'] += 1
            data['updated_at'] = now()
            con.execute('UPDATE videos SET data=? WHERE id=?', (encode(data),video_id))

    def save(self, video_id, payload):
        def mutate(data):
            raw = data['raw_transcript']
            if not raw:
                raise Problem('INVALID_STAGE', '请先成功转写。', 409)
            segments = payload['segments']
            if [s['segment_id'] for s in segments] != [s['segment_id'] for s in raw['segments']]:
                raise Problem('INVALID_TRANSCRIPT', '段ID/顺序必须与原稿一致，不允许修改时间轴。')
            if sum(len(s['text']) for s in segments) > 12000:
                raise Problem('INPUT_LIMIT', '转写全文不能超过12000字符。')
            if payload['confirm'] and not any(s['text'].strip() for s in segments):
                raise Problem('EMPTY_TRANSCRIPT', '至少保留一段有效文字才能确认。')
            if segments != data['draft']:
                data['confirmed_version_id'] = None
            data['draft'] = segments
            if payload['confirm'] and not data['confirmed_version_id']:
                snapshot = dict(version_id=str(uuid4()), version=len(data['versions'])+1, confirmed_at=now(),
                                based_on=raw['version_id'], segments=[{**source,'text':edit['text']} for source,edit in zip(raw['segments'],segments)])
                data['versions'].append(snapshot)
                data['confirmed_version_id'] = snapshot['version_id']
        return self.change(video_id, 'transcript', payload, mutate)
