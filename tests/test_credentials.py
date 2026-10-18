"""Fake tokens only; OS test targets a tmp_path-derived, isolated vault identity."""
import json
import os
import sys
import httpx
import pytest
from fastapi.testclient import TestClient
from backend.config import Config
from backend.main import create_app
from backend.services.credentials import CredentialStore, CredentialError, CredentialSettings
from backend.services.llm import LLMService
from tests.test_backend import payload
from tests.test_workflow import questions, envelope, valid_output
from tests.test_process import server

ENDPOINT = 'https://api.deepseek.com'
FAKE = 'fake-test-credential-never-paid-123'
NEW = 'fake-replacement-never-paid-456'


class Vault:
    def __init__(self):
        self.values = {}
        self.broken = False

    def read(self, endpoint):
        if self.broken:
            raise CredentialError('系统凭据不可用。')
        return self.values.get(endpoint)

    def save(self, endpoint, key):
        self.read(endpoint)
        self.values[endpoint] = key

    def delete(self, endpoint):
        self.read(endpoint)
        self.values.pop(endpoint, None)


@pytest.fixture(autouse=True)
def isolated_environment(monkeypatch):
    for name in list(os.environ):
        if name.startswith('LLM_'):
            monkeypatch.delenv(name)


def settings(key=FAKE, remember=True, **extra):
    return dict(mode='live', endpoint=ENDPOINT, model='test-model', api_key=key,
                remember_key=remember, **extra)


def application(tmp_path, vault, key='', handler=None):
    config = Config(data_dir=tmp_path, api_key=key)
    service = LLMService(config, httpx.MockTransport(handler) if handler else None, vault)
    return create_app(config, service), service


def test_save_restore_replace_delete_and_no_secret_leaks(tmp_path, caplog):
    vault = Vault()
    app, service = application(tmp_path, vault)
    with TestClient(app) as client:
        response = client.post('/api/settings/llm', json=settings())
        assert response.json()['saved_key'] is True
        assert FAKE not in response.text
        assert service.config.api_key == FAKE
        assert json.loads((tmp_path/'llm-settings.json').read_text())['remember_key'] is True
    seen = []
    def transport(request):
        seen.append(request.headers['authorization'])
        return envelope(valid_output())
    app, service = application(tmp_path, vault, handler=transport)
    with TestClient(app) as client:
        assert client.get('/api/settings/llm').json()['key_source'] == 'saved'
        assert service.config.api_key == FAKE
        assert client.post('/api/settings/llm', json=settings(NEW)).json()['saved_key']
        record = client.post('/api/challenges', json=payload()).json()
        assert questions(client, record).status_code == 200
        assert seen == ['Bearer '+NEW]
        assert client.delete('/api/settings/llm').json()['configured'] is False
        service.live_requests = 0
        other = client.post('/api/challenges', json={**payload(), 'request_id':'other'}).json()
        assert questions(client, other, 'other-ask').status_code == 503
        assert len(seen) == 1
        assert vault.values == {}
    app, service = application(tmp_path, vault)
    with TestClient(app) as client:
        assert client.get('/api/health').json()['llm']['configured'] is False
    for secret in (FAKE, NEW):
        assert secret not in caplog.text
        assert secret.encode() not in (tmp_path/'app.db').read_bytes()
        assert secret not in (tmp_path/'llm-settings.json').read_text()


def test_vault_failure_retains_session_but_disables_auto_restore(tmp_path):
    vault = Vault()
    app, service = application(tmp_path, vault)
    with TestClient(app) as client:
        client.post('/api/settings/llm', json=settings())
        vault.broken = True
        status = client.post('/api/settings/llm', json=settings(NEW)).json()
        assert status['configured'] and not status['remember_key']
        assert status['saved_key'] is None and status['credential_error']
        assert service.config.api_key == NEW
        status = client.delete('/api/settings/llm').json()
        assert not status['configured'] and status['credential_error']
        assert not json.loads((tmp_path/'llm-settings.json').read_text())['remember_key']
    vault.broken = False  # Old credential is still present; failed deletion must be visible.
    app, service = application(tmp_path, vault)
    with TestClient(app) as client:
        assert not client.get('/api/health').json()['llm']['configured']
        assert client.delete('/api/settings/llm').json()['saved_key'] is False


def test_startup_read_failure_and_env_priority(tmp_path, monkeypatch):
    vault = Vault()
    app, _ = application(tmp_path, vault)
    with TestClient(app) as client:
        client.post('/api/settings/llm', json=settings())
    monkeypatch.setenv('LLM_API_KEY', NEW)
    monkeypatch.setenv('LLM_MODEL', 'environment-model')
    config = Config(data_dir=tmp_path)
    service = LLMService(config, credential_store=vault)
    with TestClient(create_app(config, service)) as client:
        status = client.get('/api/settings/llm').json()
        assert status['key_source'] == 'environment'
        assert service.config.api_key == NEW and status['model'] == 'environment-model'
        assert client.delete('/api/settings/llm').json()['configured'] is False
    vault.values[ENDPOINT] = FAKE
    # Simulate opted-in persisted preferences after saving again.
    prefs = json.loads((tmp_path/'llm-settings.json').read_text())
    prefs['remember_key'] = True
    (tmp_path/'llm-settings.json').write_text(json.dumps(prefs))
    vault.broken = True
    monkeypatch.delenv('LLM_API_KEY')
    app, service = application(tmp_path, vault)
    with TestClient(app) as client:
        status = client.get('/api/settings/llm').json()
        assert status['credential_error'] and not status['configured']
        assert service.live_requests == 0


def test_uncheck_deletes_saved_but_keeps_session(tmp_path):
    vault = Vault()
    app, service = application(tmp_path, vault)
    with TestClient(app) as client:
        client.post('/api/settings/llm', json=settings())
        status = client.post('/api/settings/llm', json=settings('', False)).json()
        assert status['configured'] and not status['saved_key']
        assert service.config.api_key == FAKE and not vault.values
    app, _ = application(tmp_path, vault)
    with TestClient(app) as client:
        assert not client.get('/api/settings/llm').json()['configured']


@pytest.mark.parametrize('key', ['short', 'with space', 'fake-key\nmalicious', '密钥'*8, 'x'*2049])
def test_bad_keys_rejected_without_echo(tmp_path, key):
    app, service = application(tmp_path, Vault())
    with TestClient(app) as client:
        response = client.post('/api/settings/llm', json=settings(key))
        assert response.status_code in (400, 422)
        assert key not in response.text
        assert service.config.api_key == ''


@pytest.mark.parametrize('endpoint', ['http://api.deepseek.com', 'https://127.0.0.1', 'https://evil.test',
                                      'https://api.deepseek.com@evil.test', 'https://api.deepseek.com?key=fake',
                                      'https://api.deepseek.com:9000', 'https://api.deepseek.com/other'])
def test_endpoint_allowlist(tmp_path, endpoint):
    app, service = application(tmp_path, Vault())
    with TestClient(app) as client:
        body = settings(); body['endpoint'] = endpoint
        assert client.post('/api/settings/llm', json=body).status_code == 400
        assert service.config.api_key == ''


def test_endpoints_do_not_share_tokens(tmp_path, monkeypatch):
    monkeypatch.setenv('LLM_BASE_URL', 'https://provider.example/v1')
    vault = Vault()
    app, service = application(tmp_path, vault)
    with TestClient(app) as client:
        client.post('/api/settings/llm', json=settings())
        body = settings('', False);body['endpoint'] = 'https://provider.example/v1'
        assert not client.post('/api/settings/llm', json=body).json()['configured']
        body['api_key'] = NEW;body['remember_key'] = True
        client.post('/api/settings/llm', json=body)
        assert vault.values == {ENDPOINT:FAKE, 'https://provider.example/v1':NEW}
        assert client.delete('/api/settings/llm').json()['saved_key'] is False
        assert vault.values == {ENDPOINT:FAKE}


def test_sensitive_routes_reject_web_origins_and_forms(tmp_path):
    app, _ = application(tmp_path, Vault())
    with TestClient(app) as client:
        for headers in ({'Origin':'https://evil.test'}, {'Origin':'null'}, {'Sec-Fetch-Site':'same-site'}):
            assert client.post('/api/settings/llm', json=settings(), headers=headers).status_code == 403
            assert client.delete('/api/settings/llm', headers=headers).status_code == 403
        assert client.get('/api/settings/llm', headers={'Sec-Fetch-Site':'cross-site'}).status_code == 403
        assert client.post('/api/settings/llm', content=json.dumps(settings()), headers={'Content-Type':'text/plain'}).status_code == 415
        assert client.post('/api/settings/llm', json=settings(), headers={'Origin':'http://testserver'}).status_code == 200


def test_config_write_failure_is_visible_and_never_contains_token(tmp_path, monkeypatch):
    app, service = application(tmp_path, Vault())
    with TestClient(app) as client:
        def fail():
            raise CredentialError('配置文件不可写。')
        monkeypatch.setattr(service.credentials, '_write', fail)
        result = client.post('/api/settings/llm', json=settings()).json()
        assert result['credential_error'] and service.config.api_key == FAKE
        assert FAKE not in json.dumps(result)


def test_non_windows_has_no_plaintext_fallback(tmp_path, monkeypatch):
    import backend.services.credentials as credentials
    monkeypatch.setattr(credentials.sys, 'platform', 'unsupported')
    store = CredentialStore(tmp_path)
    with pytest.raises(CredentialError, match='仅支持 Windows'):
        store.save(ENDPOINT, FAKE)
    assert list(tmp_path.iterdir()) == []


def test_invalid_stored_key_is_not_loaded(tmp_path):
    store = CredentialStore(tmp_path)
    class MalformedVault:
        def get_password(self, *args):
            return 'bad\nkey'
    store._backend = lambda: MalformedVault()
    with pytest.raises(CredentialError, match='格式无效'):
        store.read(ENDPOINT)


def test_auth_failure_keeps_saved_token_without_echo_or_retry(tmp_path):
    vault = Vault()
    app, service = application(tmp_path, vault, handler=lambda request: httpx.Response(401, text=FAKE))
    with TestClient(app) as client:
        client.post('/api/settings/llm', json=settings())
        record = client.post('/api/challenges', json=payload()).json()
        response = questions(client, record)
        assert response.json()['error']['code'] == 'API_CONFIGURATION'
        assert FAKE not in response.text
        assert service.live_requests == 1 and vault.values[ENDPOINT] == FAKE


@pytest.mark.skipif(sys.platform != 'win32', reason='Requires actual Windows Credential Manager')
def test_real_windows_vault_http_process_restarts(tmp_path, monkeypatch):
    import keyring
    # Backend discovery must never be used, regardless of third-party configuration.
    monkeypatch.setattr(keyring, 'get_keyring', lambda: pytest.fail('Unsafe backend discovery'))
    store = CredentialStore(tmp_path)
    assert type(store._backend()).__module__ == 'keyring.backends.Windows'
    assert store._backend().persist == 2
    assert store.read(ENDPOINT) is None
    logs = tmp_path/'test-server.log'
    try:
        with server(tmp_path, {'LLM_MODE':'live'}, logs) as base:
            r = httpx.post(base+'/api/settings/llm', json=settings(), trust_env=False)
            assert r.json()['saved_key'] is True
            assert FAKE not in r.text and store.read(ENDPOINT) == FAKE
        with server(tmp_path, {'LLM_MODE':'live'}, logs) as base:
            status = httpx.get(base+'/api/settings/llm', trust_env=False).json()
            assert status['configured'] and status['key_source'] == 'saved'
            assert status['live_requests'] == 0
            assert httpx.post(base+'/api/settings/llm', json=settings(NEW), trust_env=False).json()['saved_key']
            assert store.read(ENDPOINT) == NEW
        with server(tmp_path, {'LLM_MODE':'live'}, logs) as base:
            assert httpx.get(base+'/api/settings/llm', trust_env=False).json()['configured']
            status = httpx.delete(base+'/api/settings/llm', trust_env=False).json()
            assert not status['configured'] and status['saved_key'] is False
            assert store.read(ENDPOINT) is None
        with server(tmp_path, {'LLM_MODE':'live'}, logs) as base:
            status = httpx.get(base+'/api/settings/llm', trust_env=False).json()
            assert not status['configured'] and status['live_requests'] == 0
        for file in tmp_path.iterdir():
            if file.suffix in ('.json', '.tmp', '.db', '.log'):
                for secret in (FAKE, NEW):
                    assert secret.encode() not in file.read_bytes(), file.name
    finally:
        store.delete(ENDPOINT)
        assert not store.configured(ENDPOINT)
