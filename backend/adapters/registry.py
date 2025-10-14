from __future__ import annotations

from typing import Any, Dict, List, Type

from .local_provider import LocalProvider
from .openai_provider import OpenAIProvider


PROVIDERS: Dict[str, Type] = {
    "local": LocalProvider,
    "openai": OpenAIProvider,
}


def list_providers() -> List[str]:
    return sorted(PROVIDERS.keys())


def get_provider(name: str, settings: Any):
    cls = PROVIDERS.get(name)
    if not cls:
        raise ValueError(f"Unknown provider: {name}")
    if name == "openai":
        return cls(api_key=getattr(settings, "openai_api_key", None))
    return cls()
