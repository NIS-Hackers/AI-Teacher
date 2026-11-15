# AI Teacher — Backend

## Setup (uv — recommended)

Install uv: https://docs.astral.sh/uv/getting-started/installation/

    cd backend
    uv sync
    uv run uvicorn app.main:app --reload --port 8000

Server runs at http://localhost:8000 (docs at /docs).

## Setup (pip fallback)

    cd backend
    python3 -m venv .venv
    source .venv/bin/activate      # Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8000

## Notes

- Never commit `.venv/` — it's machine-specific.
- The Python version is pinned in `.python-version`.
- `uv.lock` (or `requirements.txt`) is the source of truth for versions.