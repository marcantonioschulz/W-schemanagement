# Architecture

This monorepo contains:
- backend: FastAPI service exposing REST endpoints under /api
- frontend: Vite + React app consuming the API
- docker: Compose and Dockerfiles for local production-like runs

AI Provider Adapter Pattern
- A simple registry maps provider names (e.g., "local", "openai") to classes implementing a shared interface.
- Each provider implements async suggest(context: str) -> str.
- The active provider is determined by configuration (config.yaml or env vars).

Data Layer
- SQLModel with SQLite for quick start. Migration tooling can be added later.

Deployment
- docker-compose.yml defines backend and frontend services, simple health checks, and volumes for config.

Future Work
- AuthN/Z, background jobs, file uploads, inventory tagging, and real ML integration.
