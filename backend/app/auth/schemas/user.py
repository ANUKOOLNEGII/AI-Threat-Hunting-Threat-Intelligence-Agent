from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organization: Optional[str] = None
    country: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)
    acceptTerms: bool = True
    newsletter: bool = False


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    refreshToken: str
    user: UserOut


class RegisterResponse(BaseModel):
    message: str
    user: UserOut


class BaseAuthResponse(BaseModel):
    message: str
    success: bool = True


class TokenRefreshRequest(BaseModel):
    refreshToken: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8)


class VerifyEmailRequest(BaseModel):
    token: str


class PreferencesUpdate(BaseModel):
    preferences: dict[str, object]
