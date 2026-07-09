from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from .models import Report, ReportType, ReportStatus
from datetime import datetime, timedelta


class ReportRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, report_data: Dict[str, Any]) -> Report:
        report = Report(**report_data)
        self.session.add(report)
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def get_by_id(self, report_id: int) -> Optional[Report]:
        result = await self.session.execute(select(Report).where(Report.id == report_id))
        return result.scalar_one_or_none()

    async def list(
        self,
        page: int = 1,
        page_size: int = 20,
        report_type: Optional[ReportType] = None,
        status: Optional[ReportStatus] = None,
        generated_by: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> tuple[List[Report], int]:
        query = select(Report)
        
        filters = []
        if report_type:
            filters.append(Report.type == report_type)
        if status:
            filters.append(Report.status == status)
        if generated_by:
            filters.append(Report.generated_by == generated_by)
        if start_date:
            filters.append(Report.created_at >= start_date)
        if end_date:
            filters.append(Report.created_at <= end_date)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()
        
        # Get items
        query = query.order_by(Report.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        items = list(result.scalars().all())
        
        return items, total

    async def update(self, report_id: int, update_data: Dict[str, Any]) -> Optional[Report]:
        report = await self.get_by_id(report_id)
        if not report:
            return None
        
        for key, value in update_data.items():
            setattr(report, key, value)
        
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def delete(self, report_id: int) -> bool:
        report = await self.get_by_id(report_id)
        if not report:
            return False
        
        await self.session.delete(report)
        await self.session.commit()
        return True

    async def update_status(
        self,
        report_id: int,
        status: ReportStatus,
        error_message: Optional[str] = None,
        report_metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[Report]:
        update_data = {"status": status}
        
        if status == ReportStatus.GENERATING:
            update_data["started_at"] = datetime.utcnow()
        elif status == ReportStatus.COMPLETED:
            update_data["generated_at"] = datetime.utcnow()
        elif status == ReportStatus.FAILED:
            update_data["failed_at"] = datetime.utcnow()
            if error_message:
                update_data["error_message"] = error_message
        
        if report_metadata:
            update_data["report_metadata"] = report_metadata
        
        return await self.update(report_id, update_data)

    async def get_pending_reports(self) -> List[Report]:
        result = await self.session.execute(
            select(Report).where(Report.status == ReportStatus.PENDING).order_by(Report.created_at)
        )
        return list(result.scalars().all())
