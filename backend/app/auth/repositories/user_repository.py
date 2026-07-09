from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models.audit_log import AuditLog
from app.auth.models.refresh_token import RefreshToken
from app.auth.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email, User.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.id == user_id, User.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def create(self, *, email: str, password_hash: str, first_name: str, last_name: str, organization: str, country: str, role: str = "analyst") -> User:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            organization=organization,
            country=country,
            role=role,
            is_verified=False,
            is_active=True,
            preferences=json.dumps({}),
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update(self, user: User) -> User:
        user.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def soft_delete(self, user: User) -> None:
        user.is_deleted = True
        user.is_active = False
        await self.session.commit()

    async def set_password_hash(self, user: User, password_hash: str) -> None:
        user.password_hash = password_hash
        await self.session.commit()

    async def mark_verified(self, user: User) -> None:
        user.is_verified = True
        await self.session.commit()

    async def update_preferences(self, user: User, preferences: dict[str, Any]) -> User:
        user.preferences = json.dumps(preferences)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def create_refresh_token(self, user_id: str, token_hash: str) -> RefreshToken:
        refresh_token = RefreshToken(
            id=str(uuid.uuid4()),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(days=30),
        )
        self.session.add(refresh_token)
        await self.session.commit()
        await self.session.refresh(refresh_token)
        return refresh_token

    async def get_refresh_token(self, token_hash: str) -> Optional[RefreshToken]:
        result = await self.session.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, refresh_token: RefreshToken) -> None:
        refresh_token.revoked = True
        await self.session.commit()

    async def create_audit_log(self, user_id: Optional[str], action: str, details: Optional[str]) -> AuditLog:
        audit_log = AuditLog(id=str(uuid.uuid4()), user_id=user_id, action=action, details=details)
        self.session.add(audit_log)
        await self.session.commit()
        await self.session.refresh(audit_log)
        return audit_log
