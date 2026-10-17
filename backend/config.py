import os
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


@dataclass
class Config:
    data_dir: Path = field(default_factory=lambda: Path(os.environ.get('LIANZHI_DATA_DIR') or Path(os.environ.get('LOCALAPPDATA', Path.home() / '.local/share')) / 'KnowledgeCompass'))
    endpoint: str = field(default_factory=lambda: os.environ.get('LLM_BASE_URL', 'https://api.deepseek.com'))
    model: str = field(default_factory=lambda: os.environ.get('LLM_MODEL', ''))
    api_key: str = field(default_factory=lambda: os.environ.get('LLM_API_KEY', ''), repr=False)
    mode: str = field(default_factory=lambda: os.environ.get('LLM_MODE', 'live'))
    timeout: float = 60
    live_limit: int = field(default_factory=lambda: int(os.environ.get('LLM_MAX_REQUESTS', '3')))
