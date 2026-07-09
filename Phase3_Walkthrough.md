# Phase 3 Walkthrough

## Scope
Phase 3 implements the Dashboard module, core Threat Intelligence foundation, CVE storage/retrieval, IOC storage/retrieval, dashboard caching, protected API routing, and focused backend tests.

This phase intentionally does not implement AI reasoning, LangChain/Groq orchestration, threat correlation, MITRE mapping generation, detection rule generation, notifications, schedulers, reports, or background worker business logic.

`Phase2_Walkthrough.md` was not present in the workspace during implementation. The current source code was used as the source of truth.

## Dashboard Architecture
Dashboard APIs are exposed through `backend/app/threat_intel/routes/dashboard.py` and implemented by `DashboardService`.

The dashboard composes data from the same persistence layer as the threat, CVE, and IOC modules. It does not own separate business data. It provides:
- threat counts and recent threats
- CVE counts and critical CVE totals
- IOC counts and malicious IOC totals
- severity distribution
- source distribution
- timeline events
- high-severity recent alerts
- feed and system status metadata

## Threat Module Architecture
Threat Intelligence is implemented under `backend/app/threat_intel`.

Structure:
- `models/`: SQLAlchemy tables for threats, CVEs, and IOCs
- `schemas/`: Pydantic request/response validation models
- `repositories/`: async SQLAlchemy data access and filtering
- `services/`: domain logic, serialization, audit logging, cache invalidation
- `routes/`: protected FastAPI controllers
- `cache/`: Redis-backed dashboard cache

## Repository Structure
Repositories encapsulate persistence:
- `ThreatRepository`: list, search, filters, sorting, CRUD, aggregation helpers
- `CVERepository`: list, search, vendor/product/severity/status/CVSS filters, CRUD
- `IOCRepository`: list, search, type/reputation/status filters, CRUD

All repository methods use async SQLAlchemy sessions and support pagination through `page` and `pageSize`.

## Service Layer
Services own domain behavior:
- convert database rows into frontend-compatible camelCase payloads
- raise proper HTTP errors for not-found and duplicate records
- write audit log entries for create/update/delete operations
- invalidate dashboard cache after mutating threat-intel data

Dashboard service composes data from the three foundations and uses cache keys per dashboard endpoint.

## Controllers
Routes are mounted at both root and `/api/v1`, matching prior project behavior.

Implemented route groups:
- `/dashboard`
- `/threats`
- `/cves`
- `/iocs`

Every route requires JWT authentication. Mutating routes require `admin` or `analyst`; delete routes require `admin`.

## Database Models
Threat:
- ID, title, summary, category, severity, status
- source name/type/url
- published and updated timestamps
- tags, metadata, references, timeline, IOC references
- optional affected vendor/product and CVSS score

CVE:
- CVE ID, title, description, vendor, product
- CVSS score, severity, exploited flag, status
- published and updated timestamps
- CVSS metrics, references, mitigation metadata, related CVEs

IOC:
- ID, value, type, reputation, confidence
- source, threat count, first/last seen, status
- WHOIS, timeline, relationships, external intel, metadata

## Relationships
Phase 3 stores relationships as JSON metadata fields instead of enforcing relational joins. This preserves frontend detail views while avoiding premature correlation logic. Later phases can normalize relationships into dedicated tables when correlation and graph workflows are implemented.

## Caching Strategy
Dashboard cache is implemented in `DashboardCache`.

Behavior:
- Redis is used when `REDIS_URL` is configured.
- Local in-memory fallback is used when Redis is not configured or unavailable.
- TTL is configurable through `DASHBOARD_CACHE_TTL_SECONDS`.
- Cache is cleared on threat, CVE, and IOC mutations.

Cached dashboard data includes:
- summary
- statistics
- widgets
- trends
- timeline
- alerts
- feed status
- severity distribution
- source distribution
- system status

## Dashboard Data Flow
1. Request enters protected dashboard route.
2. JWT and rate-limit dependency validate access.
3. `DashboardService` checks Redis/memory cache.
4. On miss, service queries threat/CVE/IOC repositories or direct aggregate SQL.
5. Data is serialized to dashboard payload.
6. Payload is cached and returned with cache metadata.

## Threat Data Flow
1. Request enters protected threat route.
2. Pydantic validates query params or request body.
3. Service delegates data access to repository.
4. Repository performs async SQLAlchemy query with filters/sorting/pagination.
5. Service serializes rows into frontend-compatible payloads.
6. Mutations write audit logs and clear dashboard cache.

## API List
Dashboard:
- `GET /dashboard/summary`
- `GET /dashboard/statistics`
- `GET /dashboard/widgets`
- `GET /dashboard/trends`
- `GET /dashboard/timeline`
- `GET /dashboard/alerts`
- `GET /dashboard/feed-status`
- `GET /dashboard/system-status`
- `GET /dashboard/severity`
- `GET /dashboard/sources`
- `POST /dashboard/refresh`
- `GET /dashboard/metadata`

Threats:
- `GET /threats`
- `GET /threats/search`
- `GET /threats/{id}`
- `POST /threats`
- `PUT /threats/{id}`
- `DELETE /threats/{id}`

CVEs:
- `GET /cves`
- `GET /cves/{id}`
- `POST /cves`
- `PUT /cves/{id}`
- `DELETE /cves/{id}`

IOCs:
- `GET /iocs`
- `GET /iocs/{id}`
- `POST /iocs`
- `PUT /iocs/{id}`
- `DELETE /iocs/{id}`

All routes are also mounted under `/api/v1`.

## Security
Phase 3 reuses the existing JWT authentication and RBAC layer:
- read routes require authenticated users
- create/update routes allow `admin` and `analyst`
- delete routes require `admin`
- mutation routes write audit log entries
- lightweight per-user, per-path in-memory rate limiting is applied
- request validation is handled by Pydantic schemas and FastAPI query validation

## Validation
Validation includes:
- threat severity/category/status/source enums
- CVE ID pattern validation
- CVSS score range validation
- IOC type/reputation/status enums
- confidence range validation
- pagination bounds
- sorting direction bounds

## Files Created
- `backend/app/threat_intel/cache/dashboard_cache.py`
- `backend/app/threat_intel/models/base.py`
- `backend/app/threat_intel/models/threat.py`
- `backend/app/threat_intel/models/cve.py`
- `backend/app/threat_intel/models/ioc.py`
- `backend/app/threat_intel/repositories/threat_repository.py`
- `backend/app/threat_intel/repositories/cve_repository.py`
- `backend/app/threat_intel/repositories/ioc_repository.py`
- `backend/app/threat_intel/services/threat_service.py`
- `backend/app/threat_intel/services/cve_service.py`
- `backend/app/threat_intel/services/ioc_service.py`
- `backend/app/threat_intel/services/dashboard_service.py`
- `backend/app/threat_intel/routes/dashboard.py`
- `backend/app/threat_intel/routes/threats.py`
- `backend/app/threat_intel/routes/cves.py`
- `backend/app/threat_intel/routes/iocs.py`
- `backend/app/threat_intel/schemas/*.py`
- `backend/tests/test_phase3_apis.py`
- `Phase3_Walkthrough.md`

## Files Modified
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/database/session.py`
- `backend/app/auth/middleware/auth.py`
- `backend/requirements.txt`
- `Implementation_Report.md`

## Verification
Completed:
- backend tests: `7 passed`
- Python compile check with sandbox-safe pycache
- OpenAPI generation check
- live Uvicorn startup check
- `/health`, `/openapi.json`, and `/docs` returned HTTP 200

Warnings:
- Duplicate OpenAPI operation ID warnings exist because some existing routes are mounted both at root and `/api/v1`.
- Development JWT secret is short; production must set a stronger `SECRET_KEY`.

## Known Limitations
- Redis falls back to in-memory cache when `REDIS_URL` is absent or Redis is unreachable.
- No Alembic migration layer yet; tables are created with SQLAlchemy `create_all`.
- Relationship fields are JSON metadata, not normalized graph edges.
- Rate limiting is in-memory and process-local.
- Dashboard metrics are foundational aggregates, not advanced analytics.

## Recommendations For Phase 4
- Add Alembic migrations before broader schema evolution.
- Introduce normalized relationship tables for threat/CVE/IOC links.
- Replace process-local rate limiting with Redis-backed limits.
- Wire frontend services to the Phase 3 APIs.
- Add real feed ingestion jobs and scheduler orchestration.
- Keep AI reasoning and correlation separate until the data foundation has stable ingestion semantics.
