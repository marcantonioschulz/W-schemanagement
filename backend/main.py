from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    # When imported as a package: uvicorn backend.main:app
    from .adapters import get_provider, list_providers  # type: ignore
    from .models.db import create_db  # type: ignore
    from .settings import Settings  # type: ignore
except Exception:  # pragma: no cover - fallback for local runs/tests
    from adapters import get_provider, list_providers
    from models.db import create_db
    from settings import Settings


class SuggestRequest(BaseModel):
    context: str


settings = Settings.load()
create_db()

app = FastAPI(title="Laundry AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/providers")
async def providers():
    return {"providers": list_providers(), "active": settings.app.ml_provider}


@app.post("/api/ai/suggest")
async def ai_suggest(req: SuggestRequest):
    provider = get_provider(settings.app.ml_provider, settings)
    suggestion = await provider.suggest(req.context)
    return {"suggestion": suggestion, "provider": settings.app.ml_provider}
