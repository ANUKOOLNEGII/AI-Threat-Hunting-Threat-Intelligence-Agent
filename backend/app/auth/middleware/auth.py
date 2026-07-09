from __future__ import annotations

import time
from typing import Any, Callable, Optional

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models.user import User
from app.auth.repositories.user_repository import UserRepository
from app.core.config import get_settings
from app.database.session import get_session

security = HTTPBearer(auto_error=False)
_rate_limits: dict[str, list[float]] = {}


async def get_current_user_ws(
    token: str,
    session: AsyncSession,
) -> User:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise Exception("Token expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise Exception("Invalid token payload")

    repo = UserRepository(session)
    user = await repo.get_by_id(user_id)
    if not user or not user.is_active or user.is_deleted:
        raise Exception("User inactive")
    return user


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: AsyncSession = Depends(get_session),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")

    settings = get_settings()
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    repo = UserRepository(session)
    user = await repo.get_by_id(user_id)
    if not user or not user.is_active or user.is_deleted:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive")
    return user


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency


def rate_limit(max_requests: int = 120, window_seconds: int = 60) -> Callable[[Request, User], User]:
    def dependency(request: Request, user: User = Depends(get_current_user)) -> User:
        now = time.time()
        key = f"{user.id}:{request.url.path}"
        hits = [ts for ts in _rate_limits.get(key, []) if now - ts < window_seconds]
        if len(hits) >= max_requests:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
        hits.append(now)
        _rate_limits[key] = hits
        return user

    return dependency
