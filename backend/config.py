import os
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def default_model_dir():
    if getattr(sys, 'frozen', False):
        from platformdirs import user_cache_path
        return user_cache_path('KnowledgeCompass', appauthor=False) / 'models/faster-whisper-small'
    return ROOT / 'models/faster-whisper-small'


@dataclass
class Config:
    data_dir: Path = field(default_factory=lambda: Path(os.environ.get('LIANZHI_DATA_DIR') or Path(os.environ.get('LOCALAPPDATA', Path.home() / '.local/share')) / 'KnowledgeCompass'))
    endpoint: str = field(default_factory=lambda: os.environ.get('LLM_BASE_URL', 'https://api.deepseek.com'))
    model: str = field(default_factory=lambda: os.environ.get('LLM_MODEL', ''))
    api_key: str = field(default_factory=lambda: os.environ.get('LLM_API_KEY', ''), repr=False)
    mode: str = field(default_factory=lambda: os.environ.get('LLM_MODE', 'live'))
    timeout: float = 60
    live_limit: int = field(default_factory=lambda: int(os.environ.get('LLM_MAX_REQUESTS', '3')))
    asr_model_dir: Path = field(default_factory=lambda: Path(os.environ.get('LIANZHI_ASR_MODEL_DIR') or default_model_dir()))
    asr_timeout: float = 600
