from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware.auth import get_current_user, require_roles
from app.auth.schemas.user import (
    BaseAuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    PreferencesUpdate,
    RegisterResponse,
    ResetPasswordRequest,
    TokenRefreshRequest,
    UserOut,
    VerifyEmailRequest,
)
from app.auth.services.auth_service import AuthService
from app.database.session import get_session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: dict[str, Any], session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    service = AuthService(session)
    result = await service.register(
        email=payload["email"],
        password=payload["password"],
        first_name=payload.get("firstName", ""),
        last_name=payload.get("lastName", ""),
        organization=payload.get("organization", ""),
        country=payload.get("country", ""),
    )
    return {"message": "Access account created.", "user": result["user"]}


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    service = AuthService(session)
    result = await service.login(email=payload.email, password=payload.password)
    return result


@router.post("/logout", response_model=BaseAuthResponse)
async def logout(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> dict[str, Any]:
    service = AuthService(session)
    await service.logout(user.id)
    return {"message": "Logged out successfully", "success": True}


@router.post("/refresh", response_model=dict[str, str])
async def refresh(payload: TokenRefreshRequest, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.refresh(payload.refreshToken)


@router.post("/forgot-password", response_model=BaseAuthResponse)
async def forgot_password(payload: ForgotPasswordRequest, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.forgot_password(str(payload.email))


@router.post("/reset-password", response_model=BaseAuthResponse)
async def reset_password(payload: ResetPasswordRequest, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.reset_password(payload.token, payload.password)


@router.get("/verify-email", response_model=BaseAuthResponse)
async def verify_email(token: str, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.verify_email(token)


@router.post("/resend-verification", response_model=BaseAuthResponse)
async def resend_verification(payload: ForgotPasswordRequest, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.resend_verification(str(payload.email))


@router.post("/change-password", response_model=BaseAuthResponse)
async def change_password(payload: ChangePasswordRequest, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.change_password(user.id, payload.currentPassword, payload.newPassword)


@router.get("/profile", response_model=dict[str, Any])
@router.get("/users/profile", response_model=dict[str, Any])
@router.get("/users/profile/", response_model=dict[str, Any])
async def get_profile(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.get_profile(user.id)


@router.put("/profile", response_model=dict[str, Any])
@router.put("/users/profile", response_model=dict[str, Any])
@router.put("/users/profile/", response_model=dict[str, Any])
async def update_profile(payload: dict[str, Any], session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.update_profile(user.id, payload)


@router.delete("/profile", response_model=BaseAuthResponse)
@router.delete("/users/profile", response_model=BaseAuthResponse)
@router.delete("/users/profile/", response_model=BaseAuthResponse)
async def delete_profile(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.delete_profile(user.id)


@router.get("/preferences", response_model=dict[str, Any])
async def get_preferences(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.get_preferences(user.id)


@router.put("/preferences", response_model=dict[str, Any])
async def update_preferences(payload: PreferencesUpdate, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> dict[str, Any]:
    service = AuthService(session)
    return await service.update_preferences(user.id, payload.preferences)


@router.get("/admin/users", response_model=list[dict[str, Any]])
async def admin_users(session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin"))) -> list[dict[str, Any]]:
    return []
