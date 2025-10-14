# Laundry AI (Open Source, Self-Hosted, Community-Driven)

Community-first monorepo for a modular laundry management app with a FastAPI backend, a React frontend, and pluggable AI providers (local and external). Self-hosted, privacy-friendly, and easy to hack on.

Features
- Wäsche-Tracking & Sortierung (z. B. QR/RFID/NFC später)
- KI-gestützte Empfehlungen (lokal oder via externer API)
- Modularer Adapter-Ansatz für KI-Provider
- Docker-first, auch lokal startbar

Tech
- Backend: Python FastAPI + SQLModel (SQLite by default)
- Frontend: Vite + React + TypeScript
- KI-Provider: local, openai (Platzhalter)
- Deployment: Docker/Compose (K8s später)

Quick start (Docker)
1) Kopiere .env.example zu .env und passe Werte an (optional)
2) Starte Services

```bash
docker compose -f docker/docker-compose.yml up --build
```

Dann: Frontend unter http://localhost:8080, Backend unter http://localhost:8000/api

Local dev
- Backend
  - Python 3.11, dann im Ordner backend Abhängigkeiten installieren und starten.
  - Siehe Hinweise unten.
- Frontend
  - Node 18+, im Ordner frontend installieren und starten.

API Endpoints
- GET /api/health -> {"status":"ok"}
- GET /api/providers -> Liste verfügbarer Provider
- POST /api/ai/suggest -> body: {"context":"..."} -> Antwort vom Provider
- GET /api/laundry/ -> Liste der erfassten Wäschestücke inkl. Status (dirty, washing, drying, clean, folded)
- POST /api/laundry/ -> Neues Wäschestück anlegen (label, optional material/color/tag_id/status)
- PATCH /api/laundry/{id} -> Attribute oder Status aktualisieren (inkl. Statuswechsel per Workflow)
- DELETE /api/laundry/{id} -> Wäschestück entfernen

Configuration
- Top-level config: config.yaml (ml_provider: local | openai)
- Env vars: siehe .env.example
- Details in docs/configuration.md

Contributing
- Issues, PRs, Discussions willkommen.
- Bitte auf kleine, klar umrissene Commits achten.

License
- MIT (siehe LICENSE)

Try it locally (optional)
- Backend
  - Wechsel in backend und installiere requirements
  - Uvicorn starten
- Frontend
  - Wechsel in frontend, installiere npm deps, starte dev server

Weitere Hinweise und Architektur in docs/architecture.md.
