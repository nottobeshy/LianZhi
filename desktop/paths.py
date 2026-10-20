import os
from pathlib import Path
from platformdirs import user_data_path, user_cache_path, user_config_path, user_log_path


def prepare():
    name = 'KnowledgeCompass'  # Keep the existing Windows data/vault identity.
    data = Path(os.environ.get('LIANZHI_DATA_DIR') or user_data_path(name, appauthor=False))
    cache = Path(os.environ.get('LIANZHI_CACHE_DIR') or user_cache_path(name, appauthor=False))
    logs = Path(os.environ.get('LIANZHI_LOG_DIR') or user_log_path(name, appauthor=False))
    config = user_config_path(name, appauthor=False)
    for directory in (data, cache, logs):
        directory.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault('LIANZHI_DATA_DIR', str(data))
    os.environ.setdefault('LIANZHI_ASR_MODEL_DIR', str(cache/'models/faster-whisper-small'))
    # Candidate acceptance never silently renews the previous three-call authorization.
    os.environ.setdefault('LLM_MAX_REQUESTS', '10')
    return dict(data=data, cache=cache, logs=logs, config=config)
