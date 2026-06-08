import os
from pathlib import Path


def _path_from_env(name: str, default: Path) -> Path:
    value = os.environ.get(name)
    if value:
        return Path(value)
    return default


_default_root = Path(__file__).resolve().parent.parent
ROOT_DIR = _path_from_env("FLWRR_ROOT", _default_root)

DB_PATH = _path_from_env("FLWRR_DB_PATH", ROOT_DIR / "plants.db")
STATIC_DIR = _path_from_env("FLWRR_STATIC_DIR", ROOT_DIR / "static")
MODEL_PATH = _path_from_env("FLWRR_MODEL_PATH", ROOT_DIR / "best_model.pth")
