from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import json
from .models import Report, ReportType, ReportFormat, ReportStatus
from .schemas import ReportCreate, ReportUpdate, ReportData
from .repositories import ReportRepository
from ..threat_intel.repositories.threat_repository import ThreatRepository
from ..threat_intel.repositories.cve_repository import CVERepository
from ..threat_intel.repositories.ioc_repository import IOCRepository
from ..ai.services.ai_service import AIService


class ReportGenerator:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.report_repo = ReportRepository(session)
        self.threat_repo = ThreatRepository(session)
        self.cve_repo = CVERepository(session)
        self.ioc_repo = IOCRepository(session)

    async def generate_report_data(
        self,
        report_type: ReportType,
        filters: Optional[Dict[str, Any]] = None,
    ) -> ReportData:
        now = datetime.utcnow()
        start_date = filters.get("start_date") if filters else None
        end_date = filters.get("end_date") if filters else None
        
        # Set default date ranges based on report type
        if not start_date:
            if report_type == ReportType.DAILY:
                start_date = now - timedelta(days=1)
            elif report_type == ReportType.WEEKLY:
                start_date = now - timedelta(weeks=1)
            elif report_type == ReportType.MONTHLY:
                start_date = now - timedelta(days=30)
            else:
                start_date = now - timedelta(days=7)
        
        if not end_date:
            end_date = now

        # Get threat statistics
        threats, _ = await self.threat_repo.list(page=1, page_size=1000)
        cves, _ = await self.cve_repo.list(page=1, page_size=1000)
        iocs, _ = await self.ioc_repo.list(page=1, page_size=1000)

        # Generate statistics
        threat_count = len(threats)
        cve_count = len(cves)
        ioc_count = len(iocs)
        
        critical_cves = [
            {
                "id": cve.cve_id,
                "title": cve.title,
                "cvss_score": cve.cvss_score,
                "severity": cve.severity,
            }
            for cve in cves
            if cve.cvss_score and cve.cvss_score >= 9.0
        ][:10]

        # Build threat trends
        threat_trends = []
        for i in range(7):
            date = now - timedelta(days=6 - i)
            day_threats = [
                t for t in threats
                if t.published_at and t.published_at.date() == date.date()
            ]
            threat_trends.append({
                "date": date.isoformat(),
                "count": len(day_threats),
            })

        # Build IOC summary
        ioc_summary = []
        ioc_types = {}
        for ioc in iocs:
            ioc_type = ioc.type
            if ioc_type not in ioc_types:
                ioc_types[ioc_type] = 0
            ioc_types[ioc_type] += 1
        
        for ioc_type, count in ioc_types.items():
            ioc_summary.append({"type": ioc_type, "count": count})

        return ReportData(
            executive_summary=f"Threat report covering {start_date.date()} to {end_date.date()}. "
                            f"Total threats: {threat_count}, CVEs: {cve_count}, IOCs: {ioc_count}.",
            threat_statistics={
                "total_threats": threat_count,
                "total_cves": cve_count,
                "total_iocs": ioc_count,
                "critical_cves_count": len(critical_cves),
            },
            critical_cves=critical_cves,
            ioc_summary=ioc_summary,
            threat_trends=threat_trends,
            metadata={
                "generated_at": now.isoformat(),
                "report_type": report_type,
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                },
            },
        )

    def to_markdown(self, data: ReportData) -> str:
        md = f"# {data.metadata.get('report_type', 'Threat Report').title()}\n\n"
        md += f"**Generated:** {data.metadata['generated_at']}\n\n"
        md += "---\n\n"
        
        md += "## Executive Summary\n\n"
        md += f"{data.executive_summary}\n\n"
        
        md += "## Threat Statistics\n\n"
        for key, value in data.threat_statistics.items():
            md += f"- **{key.replace('_', ' ').title()}**: {value}\n"
        md += "\n"
        
        if data.critical_cves:
            md += "## Critical CVEs\n\n"
            for cve in data.critical_cves:
                md += f"- [{cve['id']}] {cve['title']} (CVSS: {cve['cvss_score']})\n"
            md += "\n"
        
        if data.ioc_summary:
            md += "## IOC Summary\n\n"
            for ioc in data.ioc_summary:
                md += f"- **{ioc['type']}**: {ioc['count']}\n"
            md += "\n"
        
        if data.threat_trends:
            md += "## Threat Trends\n\n"
            for trend in data.threat_trends:
                md += f"- {trend['date']}: {trend['count']} threats\n"
        
        return md

    def to_html(self, data: ReportData) -> str:
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>{data.metadata.get('report_type', 'Threat Report').title()}</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }}
        h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #34495e; margin-top: 30px; }}
        .summary {{ background: #f8f9fa; padding: 20px; border-radius: 8px; }}
        .stat {{ display: inline-block; background: #3498db; color: white; padding: 10px 20px; margin: 5px; border-radius: 4px; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
        th {{ background: #3498db; color: white; }}
        tr:nth-child(even) {{ background: #f8f9fa; }}
    </style>
</head>
<body>
    <h1>{data.metadata.get('report_type', 'Threat Report').title()}</h1>
    <p><strong>Generated:</strong> {data.metadata['generated_at']}</p>
    
    <div class="summary">
        <h2>Executive Summary</h2>
        <p>{data.executive_summary}</p>
    </div>
    
    <h2>Threat Statistics</h2>
    <div>
        {''.join([f'<div class="stat">{key.replace("_", " ").title()}: {value}</div>' for key, value in data.threat_statistics.items()])}
    </div>
"""
        if data.critical_cves:
            html += """
    <h2>Critical CVEs</h2>
    <table>
        <tr><th>CVE ID</th><th>Title</th><th>CVSS Score</th></tr>
"""
            for cve in data.critical_cves:
                html += f"<tr><td>{cve['id']}</td><td>{cve['title']}</td><td>{cve['cvss_score']}</td></tr>"
            html += "</table>"
        
        html += """
</body>
</html>
"""
        return html

    def to_json(self, data: ReportData) -> str:
        return json.dumps(data.model_dump(), indent=2)

    def to_pdf(self, data: ReportData) -> bytes:
        # Simple PDF placeholder - in production use a proper PDF library like ReportLab or WeasyPrint
        # For now, we'll just return HTML bytes as a placeholder
        html_content = self.to_html(data)
        return html_content.encode("utf-8")


class ReportService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.report_repo = ReportRepository(session)
        self.generator = ReportGenerator(session)

    async def create_report(
        self,
        report_data: ReportCreate,
        user_id: Optional[int] = None,
    ) -> Report:
        # Create report record
        report_dict = report_data.model_dump()
        report_dict["generated_by"] = user_id
        report = await self.report_repo.create(report_dict)
        
        # Update status to generating
        await self.report_repo.update_status(report.id, ReportStatus.GENERATING)
        
        try:
            # Generate report data
            data = await self.generator.generate_report_data(
                report_type=report.type,
                filters=report.filters,
            )
            
            # Generate content based on format
            content = None
            if report.format == ReportFormat.MARKDOWN:
                content = self.generator.to_markdown(data)
            elif report.format == ReportFormat.HTML:
                content = self.generator.to_html(data)
            elif report.format == ReportFormat.JSON:
                content = self.generator.to_json(data)
            elif report.format == ReportFormat.PDF:
                # For PDF, we'll store content as base64 or just HTML placeholder
                content = self.generator.to_html(data)
            
            # Update report with content
            await self.report_repo.update(
                report.id,
                {
                    "content": content,
                    "report_metadata": data.model_dump(),
                },
            )
            
            # Mark as completed
            report = await self.report_repo.update_status(
                report.id,
                ReportStatus.COMPLETED,
            )
            
        except Exception as e:
            await self.report_repo.update_status(
                report.id,
                ReportStatus.FAILED,
                error_message=str(e),
            )
            raise
        
        return report

    async def get_report(self, report_id: int) -> Optional[Report]:
        return await self.report_repo.get_by_id(report_id)

    async def list_reports(
        self,
        page: int = 1,
        page_size: int = 20,
        report_type: Optional[ReportType] = None,
        status: Optional[ReportStatus] = None,
        generated_by: Optional[int] = None,
    ) -> Tuple[List[Report], int]:
        return await self.report_repo.list(
            page=page,
            page_size=page_size,
            report_type=report_type,
            status=status,
            generated_by=generated_by,
        )

    async def delete_report(self, report_id: int) -> bool:
        return await self.report_repo.delete(report_id)
