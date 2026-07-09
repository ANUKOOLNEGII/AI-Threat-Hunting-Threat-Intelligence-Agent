# AI Threat Hunting & Threat Intelligence Agent

## Phase 1 Backend Foundation
A FastAPI backend foundation has been scaffolded for Phase 1 with:
- application factory and lifecycle hooks
- environment-based configuration
- logging and exception handling
- request ID and security headers middleware
- health and system routes
- connection manager placeholders for PostgreSQL, MongoDB, Redis, and ChromaDB
- initial tests for the health endpoints

## Run the Backend
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload
```

## Verify
- Health: http://127.0.0.1:8000/health
- Detailed health: http://127.0.0.1:8000/health/detailed
- Swagger docs: http://127.0.0.1:8000/docs
