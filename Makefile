.PHONY: dev backend frontend

dev:
	@echo "Start dev servers in two terminals:" 
	@echo "Backend: cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
	@echo "Frontend: cd frontend && npm install && npm run dev"

backend:
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev
