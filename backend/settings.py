from __future__ import annotations

from pathlib import Path
from typing import Optional

import yaml
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseModel):
    ml_provider: str = "local"


class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    openai_api_key: Optional[str] = None
    config_file: str = "config.yaml"
    app: AppConfig = AppConfig()

    model_config = SettingsConfigDict(env_prefix="", env_file=".env", extra="ignore")

    @classmethod
    def load(cls) -> "Settings":
        # Load YAML config if present
        config_path = Path("config.yaml")
        app_cfg = AppConfig()
        if config_path.exists():
            try:
                data = yaml.safe_load(config_path.read_text()) or {}
                if isinstance(data, dict):
                    app_cfg = AppConfig(**{k: v for k, v in data.items() if k in AppConfig.model_fields})
            except Exception:
                # Fallback to defaults on parse errors
                pass
        env = cls()
        env.app = app_cfg
        return env
