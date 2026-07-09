from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from ..database.session import get_session
from ..auth.middleware.auth import get_current_user, require_roles
from .schemas import (
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    ReportListResponse,
    ReportType,
    ReportStatus,
)
from .services import ReportService
from .models import Report

router = APIRouter()


@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Create a new report"""
    service = ReportService(db)
    report = await service.create_report(report_data, user_id=current_user.id)
    return report


@router.get("/reports", response_model=ReportListResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    report_type: Optional[ReportType] = None,
    status: Optional[ReportStatus] = None,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """List reports with pagination and filters"""
    service = ReportService(db)
    items, total = await service.list_reports(
        page=page,
        page_size=page_size,
        report_type=report_type,
        status=status,
        generated_by=current_user.id,
    )
    return ReportListResponse(
        items=items,
        total=total,
        page=page,
        pageSize=page_size,
    )


@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Get a report by ID"""
    service = ReportService(db)
    report = await service.get_report(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )
    return report


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(require_roles("admin")),
):
    """Delete a report (admin only)"""
    service = ReportService(db)
    success = await service.delete_report(report_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )
