from __future__ import annotations

import os


class OpenAIProvider:
    name = "openai"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    async def suggest(self, context: str) -> str:
        # Placeholder: do not call external APIs, just echo provider name
        prefix = "[openai placeholder]"
        suffix = "(set OPENAI_API_KEY to enable real integration later)"
        ctx = (context or "").strip()
        return f"{prefix} Suggestion for: '{ctx or 'n/a'}' {suffix}"
