# AI Teacher

## Backend setup

Install uv: https://docs.astral.sh/uv/getting-started/installation/

In a terminal from the repository root:

    cd backend
    uv sync
    uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Server runs at http://localhost:8000 (docs at /docs).

Set `GEMINI_API_KEY` in `backend/.env` before sending messages to the teacher.

## Frontend setup

Open a second terminal from the repository root:

    cd frontend
    npm ci
    npm run dev -- --host 127.0.0.1 --port 5173

Open http://127.0.0.1:5173. Keep both terminals running while using the app.

## Backend setup (pip fallback)

    cd backend
    python3 -m venv .venv
    source .venv/bin/activate      # Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8000

## Notes

- Never commit `.venv/` — it's machine-specific.
- The Python version is pinned in `.python-version`.
- `uv.lock` (or `requirements.txt`) is the source of truth for versions.