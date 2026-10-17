import hashlib
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from uuid import uuid4
from .config import ROOT


class Problem(Exception):
    def __init__(self, code, message, status=400):
        self.code, self.message, self.status = code, message, status


def now():
    return datetime.now(timezone.utc).isoformat()


def encode(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def fingerprint(value):
    return hashlib.sha256(encode(value).encode()).hexdigest()


class Database:
    def __init__(self, data_dir):
        self.path = data_dir / 'app.db'

    @contextmanager
    def connect(self):
        con = sqlite3.connect(self.path, timeout=5)
        con.row_factory = sqlite3.Row
        con.execute('PRAGMA foreign_keys=ON')
        try:
            with con:
                yield con
        finally:
            con.close()

    def initialize(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as con:
            version = con.execute('PRAGMA user_version').fetchone()[0]
            if version > 1:
                raise RuntimeError('数据库版本较新，请使用匹配的应用版本。')
            con.executescript('''
                CREATE TABLE IF NOT EXISTS topics(id TEXT PRIMARY KEY, data TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY, data TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS commands(request_id TEXT PRIMARY KEY, kind TEXT NOT NULL,
                    challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
                    fingerprint TEXT NOT NULL, result TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS jobs(request_id TEXT PRIMARY KEY, challenge_id TEXT NOT NULL
                    REFERENCES challenges(id) ON DELETE CASCADE, fingerprint TEXT NOT NULL,
                    state TEXT NOT NULL, error_code TEXT);
                PRAGMA user_version=1;
            ''')
            for topic in json.loads((ROOT / 'backend/data/topics.json').read_text(encoding='utf-8')):
                con.execute('INSERT OR IGNORE INTO topics VALUES(?,?)', (topic['id'], encode(topic)))
            con.execute("UPDATE jobs SET state='interrupted',error_code='INTERRUPTED' WHERE state='running'")

    def get(self, challenge_id):
        with self.connect() as con:
            row = con.execute('SELECT data FROM challenges WHERE id=?', (challenge_id,)).fetchone()
        if not row:
            raise Problem('NOT_FOUND', '未找到挑战记录。', 404)
        return json.loads(row['data'])

    def list(self):
        with self.connect() as con:
            return [json.loads(r['data']) for r in con.execute('SELECT data FROM challenges ORDER BY rowid DESC LIMIT 500')]

    def replay(self, con, request_id, kind, payload):
        old = con.execute('SELECT * FROM commands WHERE request_id=?', (request_id,)).fetchone()
        if not old:
            return None
        if old['kind'] != kind or old['fingerprint'] != fingerprint(payload):
            raise Problem('REQUEST_CONFLICT', '请求编号已用于不同内容，请刷新记录后重试。', 409)
        return json.loads(old['result'])

    def create(self, payload):
        with self.connect() as con:
            con.execute('BEGIN IMMEDIATE')
            old = self.replay(con, payload['request_id'], 'create', payload)
            if old:
                return old
            topic = payload['topic']
            known = con.execute('SELECT data FROM topics WHERE id=?', (topic['id'],)).fetchone()
            if known and json.loads(known['data']) != topic:
                raise Problem('TOPIC_CONFLICT', '知识点身份与题卡不匹配。', 409)
            if not known and not topic['id'].startswith('user:' + topic['vocab_id'] + ':'):
                raise Problem('INVALID_TOPIC', '未知知识点，请重新选择词条。')
            con.execute('INSERT OR IGNORE INTO topics VALUES(?,?)', (topic['id'], encode(topic)))
            data = {'id': str(uuid4()), 'topic': topic, 'explanation': payload['explanation'], 'questions': None,
                    'answers': [], 'revisions': [], 'revision': 1, 'stage': 'explained', 'created_at': now(), 'updated_at': now()}
            con.execute('INSERT INTO challenges VALUES(?,?)', (data['id'], encode(data)))
            con.execute('INSERT INTO commands VALUES(?,?,?,?,?)', (payload['request_id'], 'create', data['id'], fingerprint(payload), encode(data)))
            return data

    def change(self, challenge_id, kind, payload, mutate):
        with self.connect() as con:
            con.execute('BEGIN IMMEDIATE')
            command = {**payload, 'challenge_id': challenge_id}
            old = self.replay(con, payload['request_id'], kind, command)
            if old:
                return old
            row = con.execute('SELECT data FROM challenges WHERE id=?', (challenge_id,)).fetchone()
            if not row:
                raise Problem('NOT_FOUND', '未找到挑战记录。', 404)
            data = json.loads(row['data'])
            if data['revision'] != payload['expected_revision']:
                raise Problem('STALE_INPUT', '记录版本已变化，请重新读取，原输入不要丢弃。', 409)
            mutate(data)
            data['revision'] += 1; data['updated_at'] = now()
            con.execute('UPDATE challenges SET data=? WHERE id=?', (encode(data), challenge_id))
            con.execute('INSERT INTO commands VALUES(?,?,?,?,?)', (payload['request_id'], kind, challenge_id, fingerprint(command), encode(data)))
            return data

    def reserve_questions(self, challenge_id, payload):
        command = {**payload, 'challenge_id': challenge_id}
        with self.connect() as con:
            con.execute('BEGIN IMMEDIATE')
            replay = self.replay(con, payload['request_id'], 'questions', command)
            if replay:
                return replay
            job = con.execute('SELECT * FROM jobs WHERE request_id=?', (payload['request_id'],)).fetchone()
            if job:
                if job['fingerprint'] != fingerprint(command):
                    raise Problem('REQUEST_CONFLICT', '请求编号与原输入不匹配。', 409)
                raise Problem(job['error_code'] or 'BUSY', '此请求正在执行或此前已失败；请检查记录后显式发起新请求。', 409)
            if con.execute("SELECT 1 FROM jobs WHERE state='running'").fetchone():
                raise Problem('BUSY', '另一个模型请求正在执行。', 409)
            con.execute('INSERT INTO jobs VALUES(?,?,?,?,NULL)', (payload['request_id'], challenge_id, fingerprint(command), 'running'))
        return None

    def finish_job(self, request_id, error=None):
        with self.connect() as con:
            con.execute('UPDATE jobs SET state=?,error_code=? WHERE request_id=?', ('failed' if error else 'succeeded', error, request_id))

    def delete(self, challenge_id):
        with self.connect() as con:
            con.execute('DELETE FROM challenges WHERE id=?', (challenge_id,))
