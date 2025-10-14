# Configuration

Top-level file: config.yaml

Example:

```
ml_provider: local
# For openai provider set OPENAI_API_KEY in env
```

Environment variables (see .env.example):
- OPENAI_API_KEY: required if ml_provider=openai
- HOST (default 0.0.0.0) and PORT (default 8000) for backend
- LAUNDRY_DATABASE_URL: override default SQLite path (supports sqlite, postgres, etc.)
- VITE_API_URL for frontend to reach backend (default http://localhost:8000)

Docker Compose
- docker/docker-compose.yml mounts config.yaml into backend container as read-only.
- Use `.env` at repo root to set variables for compose.

Switching providers
- Edit config.yaml to set ml_provider to "local" or "openai".
- Restart backend.
