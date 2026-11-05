from functools import lru_cache

from sqlalchemy import Engine, create_engine

from app.core.config import get_settings


@lru_cache
def get_engine() -> Engine:
    url = get_settings().database_url
    if not url:
        raise RuntimeError("DATABASE_URL is not set")
    # Supabase hands out postgresql:// URLs; SQLAlchemy needs the psycopg (v3) driver named.
    return create_engine(
        url.replace("postgresql://", "postgresql+psycopg://", 1), pool_pre_ping=True
    )
