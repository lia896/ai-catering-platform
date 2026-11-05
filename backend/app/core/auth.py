from dataclasses import dataclass

import httpx
from fastapi import Header

from app.core.config import get_settings
from app.core.errors import ApiError


@dataclass(frozen=True)
class AuthUser:
    id: str
    email: str | None


def current_user(authorization: str | None = Header(default=None)) -> AuthUser:
    """Resolve the Supabase session token sent by the browser to its user."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise ApiError(401, "unauthenticated", "Sign in first")
    settings = get_settings()
    # Asking Supabase Auth also rejects tokens of signed-out or deleted users.
    response = httpx.get(
        f"{settings.supabase_url}/auth/v1/user",
        headers={"apikey": settings.supabase_anon_key or "", "Authorization": authorization},
        timeout=10,
    )
    if response.status_code != 200:
        raise ApiError(401, "unauthenticated", "Session expired, sign in again")
    body = response.json()
    return AuthUser(id=body["id"], email=body.get("email"))
