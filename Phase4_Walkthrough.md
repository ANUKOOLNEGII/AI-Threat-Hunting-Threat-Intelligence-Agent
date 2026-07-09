# Phase 4 Walkthrough

## Scope
Phase 4 implements threat feed collection, external connector foundations, normalization, ingestion, feed management APIs, scheduler APIs, Celery worker tasks, feed caching, and backend tests.

This phase intentionally does not implement LangChain, Groq, RAG, AI chat, threat correlation, MITRE mapping logic, detection rule generation, report generation, notification delivery, or AI reasoning.

`Phase2_Walkthrough.md` was not present in the workspace. Phase 1, Phase 3, `Implementation_Report.md`, and current source code were used as references.

## Threat Feed Architecture
Threat feed ingestion is implemented under `backend/app/feeds`.

Structure:
- `models/`: feed, feed history, feed logs, connector status, API usage, scheduler jobs
- `schemas/`: Pydantic validation contracts for feed and scheduler APIs
- `repositories/`: async persistence layer
- `connectors/`: modular external source connector framework
- `services/`: feed orchestration, normalization, scheduler execution
- `routes/`: protected FastAPI controllers
- `cache/`: Redis-backed feed cache with memory fallback

Feeds store API key references as environment variable names, not raw secrets.

## Connector Architecture
Connectors share `BaseConnector`, `ConnectorConfig`, and `ConnectorResult`.

Implemented connector classes:
- NVD
- CISA KEV
- VirusTotal
- Shodan
- AlienVault OTX
- GitHub Security Advisories
- MISP
- MITRE ATT&CK metadata
- RSS security feeds
- Vendor security advisories
- Sample/offline connector for deterministic local sync

Connector capabilities:
- endpoint configuration
- optional API-key/bearer/header auth
- request timeout management
- retry with backoff
- process-local rate limiting
- health metadata
- pagination cursor extraction
- network mode or offline sample mode
- secure failure handling through `ConnectorError`

## Normalization Engine
`NormalizationService` converts raw connector records into existing Phase 3 persistence contracts.

Responsibilities:
- normalize threat objects
- normalize CVE records
- normalize IOC records
- normalize timestamps
- normalize severity and category values
- validate required fields
- deduplicate records within a sync batch
- upsert existing records through Phase 3 repositories
- reject malformed records without failing the entire sync

Storage targets:
- `ThreatRepository`
- `CVERepository`
- `IOCRepository`

## Ingestion Workflow
1. Feed sync is triggered manually, by scheduler API, or by Celery task.
2. `FeedService` loads feed configuration.
3. Matching connector is built from the registry.
4. Connector fetches raw records.
5. Normalization service validates and transforms records.
6. Existing repositories create or update Threat/CVE/IOC records.
7. Feed sync history and feed logs are persisted.
8. Connector status and API usage statistics are updated.
9. Feed and dashboard caches are invalidated.

## Scheduler Architecture
Scheduler APIs are implemented by `SchedulerService`.

Default jobs are materialized in the database:
- Feed Synchronization: every 5 minutes
- CVE Update: every 15 minutes
- IOC Refresh: every 30 minutes
- Feed Health Check: every 10 minutes
- Threat Statistics Refresh: hourly
- Expired Cache Cleanup: daily

Scheduler supports:
- job listing
- manual run
- pause
- resume
- run history
- status

The current scheduler is API-driven and database-backed. Celery worker tasks are available for production scheduling. A persistent APScheduler or Celery Beat process can be added once deployment topology is finalized.

## Celery Workflow
Celery app: `backend/app/workers/celery_app.py`.

Tasks:
- `sync_feed_task`
- `sync_all_feeds_task`
- `refresh_cves_task`
- `refresh_iocs_task`
- `normalize_metadata_task`
- `retry_failed_jobs_task`
- `cleanup_cache_task`
- `worker_health_task`

Local defaults:
- broker: `memory://`
- backend: `cache+memory://`

Production variables:
- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`

## Repository Layer
Feed repository handles:
- feed CRUD
- enabled feed lookup
- feed sync state
- history writes and reads
- log writes and reads
- connector status
- API usage statistics

Scheduler repository handles:
- default job creation
- job listing
- pause/resume state
- run history

## Service Layer
Feed service handles:
- registration and validation
- sync orchestration
- connector construction
- sync history and log writing
- audit logging
- cache invalidation
- feed statistics and health payloads

Scheduler service handles:
- default scheduler job lifecycle
- manual execution
- pause/resume
- history/status serialization
- cache cleanup jobs

## Feed Models
Database models:
- `ThreatFeed`
- `FeedSyncHistory`
- `FeedLog`
- `ConnectorStatus`
- `APIUsageStatistic`
- `SchedulerJob`
- `SchedulerRunHistory`

## Database Relationships
Phase 4 uses feed IDs and job IDs as indexed references instead of strict foreign keys. This preserves SQLite/PostgreSQL flexibility while the project lacks Alembic migrations. Future migration work should convert these into formal relationships.

## API List
Feeds:
- `GET /feeds`
- `POST /feeds`
- `PUT /feeds/{id}`
- `DELETE /feeds/{id}`
- `GET /feeds/status`
- `GET /feeds/history`
- `GET /feeds/statistics`
- `POST /feeds/sync`
- `POST /feeds/sync/{id}`
- `GET /feeds/logs`
- `GET /feeds/health`

Scheduler:
- `GET /scheduler/jobs`
- `POST /scheduler/run`
- `POST /scheduler/pause`
- `POST /scheduler/resume`
- `GET /scheduler/history`
- `GET /scheduler/status`

All routes are mounted at root and `/api/v1`.

## Retry Strategy
Connector retries use bounded exponential backoff. Failed syncs update feed status, feed health, feed history, connector status, API usage error counts, and feed logs. After repeated failures, connector circuit breaker metadata opens for a configurable reset period.

## Caching Strategy
Feed cache:
- Redis when `REDIS_URL` is configured
- memory fallback when Redis is absent or unavailable
- TTL controlled by `FEED_CACHE_TTL_SECONDS`

Dashboard cache is cleared after successful ingestion.

## Logging Strategy
Feed operational logs are persisted to `feed_logs`.

Logged events include:
- feed creation
- feed update
- feed deletion
- sync start
- sync success
- sync failure

Mutation routes also write existing auth audit log entries.

## Security Decisions
- All feed and scheduler endpoints require JWT.
- Feed create/update/sync allow `admin` and `analyst`.
- Feed delete and scheduler pause/resume require `admin`.
- API key values are loaded from environment variables and are not persisted.
- Connector exceptions are converted into controlled sync failure payloads.
- Request bodies and query params use Pydantic validation.
- Existing per-user route rate limiting is reused.

## Configuration
New settings:
- `FEED_CACHE_TTL_SECONDS`
- `FEED_DEFAULT_TIMEOUT_SECONDS`
- `FEED_DEFAULT_RETRY_COUNT`
- `FEED_CIRCUIT_BREAKER_FAILURE_THRESHOLD`
- `FEED_CIRCUIT_BREAKER_RESET_SECONDS`
- `NVD_API_KEY`
- `CISA_KEV_API_KEY`
- `VIRUSTOTAL_API_KEY`
- `SHODAN_API_KEY`
- `ALIENVAULT_OTX_API_KEY`
- `GITHUB_TOKEN`
- `MISP_API_KEY`
- `MITRE_ATTACK_API_KEY`
- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`

## Files Created
- `backend/app/feeds/cache/feed_cache.py`
- `backend/app/feeds/connectors/base.py`
- `backend/app/feeds/connectors/providers.py`
- `backend/app/feeds/models/feed.py`
- `backend/app/feeds/models/scheduler.py`
- `backend/app/feeds/repositories/feed_repository.py`
- `backend/app/feeds/repositories/scheduler_repository.py`
- `backend/app/feeds/routes/feeds.py`
- `backend/app/feeds/routes/scheduler.py`
- `backend/app/feeds/schemas/feed.py`
- `backend/app/feeds/schemas/scheduler.py`
- `backend/app/feeds/services/feed_service.py`
- `backend/app/feeds/services/normalization_service.py`
- `backend/app/feeds/services/scheduler_service.py`
- `backend/app/workers/celery_app.py`
- `backend/app/workers/tasks.py`
- `backend/tests/test_phase4_feeds.py`
- `Phase4_Walkthrough.md`

## Files Modified
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/database/session.py`
- `backend/app/threat_intel/repositories/ioc_repository.py`
- `Implementation_Report.md`

## Verification
Completed:
- backend tests: `11 passed`
- Python compile check with sandbox-safe pycache
- OpenAPI generation check
- live Uvicorn startup check
- `/health`, `/openapi.json`, and `/docs` returned HTTP 200
- Celery worker booted and registered Phase 4 tasks

Warnings:
- Duplicate OpenAPI operation ID warnings remain from existing dual route mounting.
- Development JWT secret is short; production must configure `SECRET_KEY`.
- Local Celery uses in-memory transport unless production broker variables are set.

## Known Limitations
- No Alembic migration layer yet.
- Scheduler is API/database-driven; no long-running APScheduler daemon is started by the API process.
- Network connector sync is implemented but tests use offline sample mode to avoid network/API-key dependency.
- Rate limiting and circuit breaker state are process-local except persisted connector failure state.
- MISP and custom RSS/vendor feeds need deployment-specific endpoints.

## Recommendations For Phase 5
- Add Alembic migrations before more schema changes.
- Add deployment topology for API, Celery worker, Celery Beat, and optional APScheduler service.
- Wire frontend admin feed/scheduler views to Phase 4 APIs.
- Add real integration tests with Redis and a test broker.
- Introduce AI/RAG only after ingestion sources and normalized storage are stable.
