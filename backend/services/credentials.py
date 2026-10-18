"""Windows-only, explicitly selected vault. Never use keyring backend discovery."""
import hashlib
import json
import os
import re
import sys
from urllib.parse import urlsplit


class CredentialError(Exception):
    pass


def valid_key(value):
    # Provider-neutral bearer token syntax; this does not prove server acceptance.
    return isinstance(value, str) and bool(re.fullmatch(r'[\x21-\x7e]{8,2048}', value))


def normalize_endpoint(value, allowed_hosts):
    try:
        u = urlsplit(value)
        if (u.scheme != 'https' or u.hostname not in allowed_hosts or u.port not in (None, 443)
                or u.username or u.password or u.query or u.fragment or '\\' in value
                or any(ord(c) <= 32 or ord(c) > 126 for c in value)):
            raise ValueError
        if u.path not in ('', '/', '/v1', '/v1/'):
            raise ValueError
        return 'https://' + u.hostname + u.path.rstrip('/')
    except (ValueError, AttributeError):
        raise CredentialError('端点须为已允许主机的 HTTPS 地址（可选 /v1）；自定义主机请由启动环境 LLM_BASE_URL 指定。') from None


class CredentialStore:
    def __init__(self, data_dir):
        profile = hashlib.sha256(str(data_dir.resolve()).casefold().encode()).hexdigest()[:24]
        self.prefix = 'LianZhi/' + profile + '/'

    def _backend(self):
        if sys.platform != 'win32':
            raise CredentialError('系统安全凭据存储不可用；本轮仅支持 Windows 凭据管理器。')
        try:
            from keyring.backends.Windows import WinVaultKeyring
            backend = WinVaultKeyring()
            if type(backend) is not WinVaultKeyring or backend.priority <= 0:
                raise RuntimeError
            backend.persist = 'local machine'  # Persist across sessions, without roaming.
            return backend
        except Exception:
            raise CredentialError('Windows 安全凭据后端不可用；未使用任何明文存储。') from None

    def _name(self, endpoint):
        return self.prefix + hashlib.sha256(endpoint.encode()).hexdigest()

    def read(self, endpoint):
        try:
            value = self._backend().get_password(self._name(endpoint), 'api-key')
            if value is not None and not valid_key(value):
                raise CredentialError('已保存凭据格式无效，请替换或删除；未自动调用模型。')
            return value
        except CredentialError:
            raise
        except Exception:
            raise CredentialError('读取 Windows 凭据失败；请重新配置本次会话密钥。') from None

    def configured(self, endpoint):
        return self.read(endpoint) is not None

    def save(self, endpoint, value):
        if not valid_key(value):
            raise CredentialError('API Key 须为 8–2048 个非空白 ASCII 字符。')
        try:
            self._backend().set_password(self._name(endpoint), 'api-key', value)
            if self.read(endpoint) != value:
                raise CredentialError('系统凭据保存后的校验失败。')
        except CredentialError:
            raise
        except Exception:
            raise CredentialError('保存 Windows 凭据失败；密钥仅在本次会话使用。') from None

    def delete(self, endpoint):
        try:
            backend = self._backend()
            if backend.get_password(self._name(endpoint), 'api-key') is not None:
                backend.delete_password(self._name(endpoint), 'api-key')
            if backend.get_password(self._name(endpoint), 'api-key') is not None:
                raise CredentialError('系统凭据删除校验失败。')
        except CredentialError:
            raise
        except Exception:
            raise CredentialError('删除 Windows 凭据失败；旧凭据可能仍在系统中，请重试删除。') from None


class CredentialSettings:
    """Non-secret preference file + vault lifecycle, owned by the existing model lock."""
    def __init__(self, config, store=None):
        self.config = config
        self.store = store or CredentialStore(config.data_dir)
        self.path = config.data_dir / 'llm-settings.json'
        self.remember = False
        self.saved = None
        self.error = ''
        self.source = 'environment' if config.api_key else 'none'
        self.allowed_hosts = {'api.deepseek.com'}
        # Only a process-owner supplied endpoint can extend the UI allowlist.
        configured_url = os.environ.get('LLM_BASE_URL', '')
        try:
            u = urlsplit(configured_url)
            if u.scheme == 'https' and u.hostname:
                self.allowed_hosts.add(u.hostname)
        except ValueError:
            pass

    def restore(self):
        c = self.config
        if c.api_key and not valid_key(c.api_key):
            c.api_key, self.source = '', 'none'
            self.error = '环境变量密钥格式无效，请重新配置。'
            return
        try:
            if self.path.exists():
                if self.path.stat().st_size > 4096:
                    raise ValueError
                prefs = json.loads(self.path.read_text(encoding='utf-8'))
                if (set(prefs) != {'mode', 'endpoint', 'model', 'remember_key'}
                        or prefs['mode'] not in ('live', 'mock')
                        or not isinstance(prefs['model'], str) or len(prefs['model']) > 120
                        or type(prefs['remember_key']) is not bool):
                    raise ValueError
                endpoint = normalize_endpoint(os.environ.get('LLM_BASE_URL', prefs['endpoint']), self.allowed_hosts)
                for field, env in [('mode', 'LLM_MODE'), ('endpoint', 'LLM_BASE_URL'), ('model', 'LLM_MODEL')]:
                    if env not in os.environ:
                        setattr(c, field, endpoint if field == 'endpoint' else prefs[field])
                self.remember = prefs['remember_key']
            c.endpoint = normalize_endpoint(c.endpoint, self.allowed_hosts)
            # Do not touch the OS vault at all unless the user opted in.
            if self.remember:
                stored = self.store.read(c.endpoint)
                self.saved = stored is not None
                if stored and not c.api_key:
                    c.api_key, self.source = stored, 'saved'
        except CredentialError as exc:
            self.error = str(exc)
        except (OSError, ValueError, TypeError, KeyError):
            self.error = '本地非敏感配置无法读取或格式异常；未覆盖原文件，请检查后重新配置。'

    def _write(self):
        c = self.config
        prefs = dict(mode=c.mode, endpoint=c.endpoint, model=c.model, remember_key=self.remember)
        temporary = self.path.with_suffix('.tmp')
        try:
            temporary.write_text(json.dumps(prefs, ensure_ascii=False), encoding='utf-8')
            temporary.replace(self.path)
        except OSError:
            raise CredentialError('非敏感配置保存失败；下次启动的配置可能仍为旧值，请检查数据目录权限。') from None

    def apply(self, body):
        c = self.config
        endpoint = normalize_endpoint(body.endpoint, self.allowed_hosts)
        key = body.api_key.get_secret_value()
        if key and not valid_key(key):
            raise CredentialError('API Key 须为 8–2048 个非空白 ASCII 字符。')
        changed = endpoint != c.endpoint
        c.mode, c.endpoint, c.model = body.mode, endpoint, body.model.strip()
        if key:
            c.api_key, self.source = key, 'session'
        elif changed:
            c.api_key, self.source = '', 'none'
        self.error = ''
        # Omitted flag preserves old API clients' session-only behavior.
        remember = body.remember_key if body.remember_key is not None else (self.remember and not changed)
        try:
            if remember:
                if not c.api_key:
                    c.api_key = self.store.read(endpoint) or ''
                    self.source = 'saved' if c.api_key else 'none'
                if not c.api_key:
                    raise CredentialError('请先输入 API Key 再选择记住。')
                self.store.save(endpoint, c.api_key)
                self.saved, self.remember = True, True
            else:
                self.remember = False
                if self.source == 'saved':
                    self.source = 'session'
                if body.remember_key is False or changed or self.saved:
                    self.store.delete(endpoint)
                self.saved = False
        except CredentialError as exc:
            self.remember, self.saved = False, None
            self.error = str(exc) + ' 本次会话可继续使用；持久化未确认成功，旧凭据可能仍存在。'
        try:
            self._write()
        except CredentialError as exc:
            self.error += (' ' if self.error else '') + str(exc)

    def clear(self):
        # Always revoke in-memory use, even when the vault is unavailable.
        self.config.api_key, self.source, self.remember = '', 'none', False
        self.error = ''
        try:
            self.store.delete(self.config.endpoint)
            self.saved = False
        except CredentialError as exc:
            self.saved = None
            self.error = str(exc)
        try:
            self._write()
        except CredentialError as exc:
            self.error += (' ' if self.error else '') + str(exc)

    def status(self):
        return dict(remember_key=self.remember, saved_key=self.saved, key_source=self.source,
                    credential_error=self.error, credential_backend='Windows Credential Manager (explicit WinVaultKeyring)')
