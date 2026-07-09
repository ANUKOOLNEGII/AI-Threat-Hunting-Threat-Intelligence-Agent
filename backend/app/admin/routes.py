from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from ..database.session import get_session
from ..auth.middleware.auth import get_current_user, require_roles
from ..auth.repositories.user_repository import UserRepository
from ..auth.models.audit_log import AuditLog
from ..auth.models.user import User
from .schemas import (
    UserUpdate,
    UserResponse,
    UserListResponse,
    AuditLogResponse,
    AuditLogListResponse,
)
from sqlalchemy import select, func

router = APIRouter()


@router.get("/admin/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("admin")),
):
    """List all users (admin only)"""
    repo = UserRepository(db)
    query = select(User)
    
    filters = []
    if role:
        filters.append(User.role == role)
    if is_active is not None:
        filters.append(User.is_active == is_active)
    filters.append(User.is_deleted == False)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar_one()
    
    # Get items
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(User.created_at.desc())
    result = await db.execute(query)
    items = list(result.scalars().all())
    
    return UserListResponse(
        items=items,
        total=total,
        page=page,
        pageSize=page_size,
    )


@router.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("admin")),
):
    """Get a user by ID (admin only)"""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("admin")),
):
    """Update a user (admin only)"""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    update_data = user_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("admin")),
):
    """Soft delete a user (admin only)"""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.is_deleted = True
    user.is_active = False
    await db.commit()


@router.get("/admin/audit-logs", response_model=AuditLogListResponse)
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("admin")),
):
    """List audit logs (admin only)"""
    query = select(AuditLog)
    
    filters = []
    if user_id:
        filters.append(AuditLog.user_id == user_id)
    if action:
        filters.append(AuditLog.action == action)
    
    if filters:
        from sqlalchemy import and_
        query = query.where(and_(*filters))
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar_one()
    
    # Get items
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(AuditLog.created_at.desc())
    result = await db.execute(query)
    items = list(result.scalars().all())
    
    return AuditLogListResponse(
        items=items,
        total=total,
        page=page,
        pageSize=page_size,
    )
