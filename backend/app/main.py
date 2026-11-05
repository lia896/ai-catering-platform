from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.config import get_settings
from app.core.errors import register_error_handlers

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"

app = FastAPI(title="AI Catering Platform")
register_error_handlers(app)
app.include_router(router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "env": get_settings().app_env}


@app.get("/config/public")
def public_config() -> dict[str, str | None]:
    # Only the browser-safe values: the anon key is public by design (RLS guards the data).
    settings = get_settings()
    return {"supabase_url": settings.supabase_url, "supabase_anon_key": settings.supabase_anon_key}


# Mounted last so API routes take precedence.
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
