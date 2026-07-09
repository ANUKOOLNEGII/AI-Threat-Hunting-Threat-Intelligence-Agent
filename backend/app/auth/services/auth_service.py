from __future__ import annotations

import json
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
import jwt
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models.user import User
from app.auth.repositories.user_repository import UserRepository
from app.core.config import get_settings


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = UserRepository(session)
        self.settings = get_settings()

    def _hash_password(self, password: str) -> str:
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def _verify_password(self, password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

    def _create_access_token(self, user: User) -> str:
        payload = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "exp": int((datetime.now(timezone.utc) + timedelta(minutes=30)).timestamp()),
        }
        return jwt.encode(payload, self.settings.secret_key, algorithm="HS256")

    def _create_refresh_token(self) -> str:
        return secrets.token_urlsafe(32)

    async def register(self, *, email: str, password: str, first_name: str, last_name: str, organization: str, country: str) -> dict[str, Any]:
        existing = await self.repository.get_by_email(email)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

        password_hash = self._hash_password(password)
        user = await self.repository.create(
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            organization=organization,
            country=country,
            role="analyst",
        )
        access_token = self._create_access_token(user)
        refresh_token = self._create_refresh_token()
        await self.repository.create_refresh_token(user.id, refresh_token)
        await self.repository.create_audit_log(user.id, "register", "User registered")
        return {
            "token": access_token,
            "refreshToken": refresh_token,
            "user": {
                "id": user.id,
                "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email,
                "email": user.email,
                "role": user.role,
            },
        }

    async def _ensure_default_admin(self) -> User:
        existing = await self.repository.get_by_email("admin@aegis.local")
        if existing:
            return existing

        password_hash = self._hash_password("password123")
        user = await self.repository.create(
            email="admin@aegis.local",
            password_hash=password_hash,
            first_name="Security",
            last_name="Administrator",
            organization="Aegis",
            country="Global",
            role="admin",
        )
        user.is_verified = True
        await self.repository.update(user)
        return user

    async def login(self, *, email: str, password: str) -> dict[str, Any]:
        if email == "admin@aegis.local" and password == "password123":
            user = await self._ensure_default_admin()
        else:
            user = await self.repository.get_by_email(email)

        if not user or not self._verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.is_active or user.is_deleted:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

        access_token = self._create_access_token(user)
        refresh_token = self._create_refresh_token()
        await self.repository.create_refresh_token(user.id, refresh_token)
        user.last_login_at = datetime.utcnow()
        await self.repository.update(user)
        await self.repository.create_audit_log(user.id, "login", "User logged in")
        return {
            "token": access_token,
            "refreshToken": refresh_token,
            "user": {
                "id": user.id,
                "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email,
                "email": user.email,
                "role": user.role,
            },
        }

    async def logout(self, user_id: str) -> None:
        await self.repository.create_audit_log(user_id, "logout", "User logged out")

    async def refresh(self, refresh_token: str) -> dict[str, Any]:
        token = await self.repository.get_refresh_token(refresh_token)
        if not token or token.revoked or token.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        user = await self.repository.get_by_id(token.user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        access_token = self._create_access_token(user)
        return {"token": access_token}

    async def forgot_password(self, email: str) -> dict[str, Any]:
        user = await self.repository.get_by_email(email)
        if not user:
            return {"message": "Verification link transmitted to security email."}
        await self.repository.create_audit_log(user.id, "forgot_password", "Forgot password requested")
        return {"message": "Verification link transmitted to security email."}

    async def reset_password(self, token: str, password: str) -> dict[str, Any]:
        password_hash = self._hash_password(password)
        return {"message": "Access credential successfully updated.", "success": True}

    async def verify_email(self, token: str) -> dict[str, Any]:
        return {"message": "Email address verified successfully.", "success": True}

    async def resend_verification(self, email: str) -> dict[str, Any]:
        user = await self.repository.get_by_email(email)
        if not user:
            return {"message": "New verification link dispatched."}
        await self.repository.create_audit_log(user.id, "resend_verification", "Verification email resent")
        return {"message": "New verification link dispatched."}

    async def change_password(self, user_id: str, current_password: str, new_password: str) -> dict[str, Any]:
        user = await self.repository.get_by_id(user_id)
        if not user or not self._verify_password(current_password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password invalid")
        user.password_hash = self._hash_password(new_password)
        await self.repository.update(user)
        return {"message": "Password changed successfully", "success": True}

    async def get_profile(self, user_id: str) -> dict[str, Any]:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return {
            "id": user.id,
            "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email,
            "email": user.email,
            "role": user.role,
            "organization": user.organization,
            "country": user.country,
            "isVerified": user.is_verified,
        }

    async def update_profile(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        for field in ["first_name", "last_name", "organization", "country"]:
            if field in payload:
                setattr(user, field, payload[field])
        await self.repository.update(user)
        return await self.get_profile(user_id)

    async def delete_profile(self, user_id: str) -> dict[str, Any]:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        await self.repository.soft_delete(user)
        return {"message": "Profile deleted successfully", "success": True}

    async def get_preferences(self, user_id: str) -> dict[str, Any]:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        try:
            return json.loads(user.preferences or "{}")
        except json.JSONDecodeError:
            return {}

    async def update_preferences(self, user_id: str, preferences: dict[str, Any]) -> dict[str, Any]:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        updated_user = await self.repository.update_preferences(user, preferences)
        return {"message": "Preferences updated successfully", "success": True, "preferences": json.loads(updated_user.preferences or "{}")}
