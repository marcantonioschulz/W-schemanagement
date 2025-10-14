from __future__ import annotations

from typing import Protocol


class ProviderProtocol(Protocol):
    name: str

    async def suggest(self, context: str) -> str:  # pragma: no cover - interface
        ...
