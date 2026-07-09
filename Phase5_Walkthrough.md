# Phase 5 Walkthrough

## Scope
Phase 5 implements the AI Intelligence Layer: AI chat, LangChain-style orchestration, Groq integration, local RAG/vector retrieval, modular AI agents, threat correlation, detection rule generation, mitigation generation, prompt safety, conversation persistence, and AI APIs.

This phase intentionally does not implement report generation, notification systems, email reporting, Slack integration, executive dashboard enhancements, monitoring dashboards, production deployment, or CI/CD.

`Phase2_Walkthrough.md` was not present in the workspace. Phase 1, Phase 3, Phase 4, `Implementation_Report.md`, and current source code were used as references.

## AI Architecture
AI is implemented under `backend/app/ai`.

Structure:
- `models/`: conversations, messages, prompt logs, vector documents, threat correlations
- `schemas/`: AI chat, analysis, detection, references, messages
- `repositories/`: conversation, prompt, vector, and correlation persistence
- `langchain/`: prompt manager, output parser, agent router
- `groq/`: Groq API wrapper with local fallback
- `vector/`: deterministic embedding and vector search service
- `rag/`: context and source builder
- `agents/`: independent cybersecurity agents
- `security/`: prompt injection and sensitive-output guard
- `routes/`: protected FastAPI AI APIs

## LangChain Architecture
The project now includes a LangChain-compatible internal orchestration layer without requiring external network access.

Components:
- Prompt Builder: renders task-specific prompt templates.
- Prompt Manager: owns prompt templates and versions.
- Agent Router: routes questions to threat, CVE, IOC, malware, MITRE, correlation, detection, or mitigation agents.
- Retriever: vector search over indexed threat/CVE/IOC records.
- Memory: persisted conversations and messages.
- Output Parser: converts markdown into structured frontend sections.
- Tool Calling Foundation: agents and services act as tool boundaries.
- Structured Output: responses include `sections`, references, confidence, and token usage.
- Prompt Logging: hashes, versions, token usage, and metadata are stored.

## Groq Integration
`GroqClient` supports:
- API-key loading from `GROQ_API_KEY`
- configurable model via `GROQ_MODEL`
- configurable base URL and timeout
- retry handling
- streaming token generator
- token usage tracking
- health check
- secure local fallback when no API key is configured or provider calls fail

Local fallback makes tests and development deterministic.

## Prompt Templates
Current templates:
- `cyber_analyst`
- `detection_rule`
- `mitigation`

Each template is versioned as `v1` and rendered through `PromptManager`.

## Prompt Flow
1. User input is sanitized and checked for prompt injection.
2. Agent router selects an agent.
3. RAG service retrieves relevant context.
4. Prompt manager renders the final prompt.
5. Groq client returns provider or local-fallback output.
6. Output parser extracts structured sections.
7. AI service persists assistant message and prompt log.

## Retriever Flow
1. Existing threat, CVE, and IOC records are indexed.
2. Text is embedded with deterministic hash-bucket embeddings.
3. Query embedding is compared with stored document embeddings.
4. Top-K documents are returned with metadata and similarity scores.
5. Sources are converted into frontend-compatible references.

## RAG Architecture
RAG supports:
- context compression by truncating per-document content
- Top-K retrieval
- collection filtering foundation
- source attribution
- confidence scores derived from retrieval quality
- metadata propagation

Indexed collections:
- Threat Reports
- Threat Articles
- CVEs
- IOCs
- Malware
- Threat Actors
- MITRE ATT&CK
- Security Advisories
- Vendor Advisories
- AI Conversations

## Vector Database
Phase 5 stores vector documents in SQLAlchemy JSON columns through `VectorDocument`.

ChromaDB remains configured as a dependency/future external vector backend. The current implementation provides a deterministic local vector layer that works without a running Chroma service.

Stored data:
- embeddings
- metadata
- source references
- similarity scores at query time

## Embedding Strategy
Embeddings use deterministic 64-dimension hash-bucket vectors. This keeps development/test behavior stable and avoids external embedding APIs. Later phases can swap this for provider embeddings or Chroma-native embeddings behind `VectorService`.

## AI Agent Design
Implemented independent agents:
- Threat Summarization Agent
- Threat Classification Agent
- Threat Correlation Agent
- CVE Intelligence Agent
- IOC Intelligence Agent
- Malware Analysis Agent
- Phishing Analysis Agent
- MITRE Mapping Agent
- Risk Assessment Agent
- Detection Rule Agent
- Mitigation Agent
- Executive Summary Agent

Each agent owns a task description and optional response enrichment.

## Threat Correlation Workflow
`ThreatCorrelationService` correlates threats, CVEs, and IOCs using:
- reference ID matching
- severity similarity
- indicator value matching
- source matching
- confidence scoring

Relationships are persisted in `ai_threat_correlations`.

## Detection Rule Workflow
`POST /ai/detection-rule`:
1. Builds retrieval context.
2. Renders the detection prompt.
3. Calls Groq or local fallback.
4. Ensures a detection rule section exists.
5. Returns markdown plus structured sections, references, confidence, and token usage.

Supported requested rule types:
- Sigma
- YARA
- Snort
- Suricata
- Windows
- Linux
- EDR

## Mitigation Workflow
`POST /ai/mitigation` generates:
- patch recommendations
- compensating controls
- IOC blocking guidance
- EDR/SIEM hunt recommendations
- validation steps
- temporary workarounds

## Conversation Memory
Conversation memory is persisted with:
- `AIConversation`
- `AIMessage`

Supported:
- conversation history
- session isolation per user ID
- message persistence
- delete all history
- context metadata
- streaming response endpoint behavior

## Security
Implemented:
- prompt injection protection
- input sanitization
- sensitive output filtering
- confidence threshold handling
- JWT/RBAC protection
- AI route rate limiting through existing middleware dependency
- prompt logging without storing raw secrets
- source attribution in responses

Blocked input examples include attempts to reveal system prompts, ignore instructions, dump secrets, or exfiltrate data.

## Caching
AI uses the existing database-backed memory and vector store. Dashboard/feed caches are not bypassed. Future phases may add Redis caching around RAG context and provider responses.

## API List
AI:
- `POST /ai/chat`
- `GET /ai/history`
- `DELETE /ai/history`
- `GET /ai/suggestions`
- `GET /ai/health`
- `POST /ai/threat-summary`
- `POST /ai/ioc-analysis`
- `POST /ai/cve-analysis`
- `POST /ai/malware-analysis`
- `POST /ai/phishing-analysis`
- `POST /ai/report-summary`
- `POST /ai/detection-rule`
- `POST /ai/mitigation`
- `POST /ai/attack-mapping`
- `POST /ai/threat-correlation`

All routes are mounted at root and `/api/v1`.

## Files Created
- `backend/app/ai/agents/agents.py`
- `backend/app/ai/groq/client.py`
- `backend/app/ai/langchain/prompt_manager.py`
- `backend/app/ai/langchain/router.py`
- `backend/app/ai/models/ai.py`
- `backend/app/ai/repositories/ai_repository.py`
- `backend/app/ai/routes/ai.py`
- `backend/app/ai/schemas/ai.py`
- `backend/app/ai/security/guard.py`
- `backend/app/ai/services/ai_service.py`
- `backend/app/ai/services/correlation_service.py`
- `backend/app/ai/vector/vector_service.py`
- `backend/app/ai/rag/rag_service.py`
- `backend/tests/test_phase5_ai.py`
- `Phase5_Walkthrough.md`

## Files Modified
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/database/session.py`
- `Implementation_Report.md`

## Verification
Completed:
- backend tests: `15 passed`
- Python compile check with sandbox-safe pycache
- OpenAPI generation check
- live Uvicorn startup check
- `/health`, `/openapi.json`, and `/docs` returned HTTP 200
- AI routes present in Swagger/OpenAPI
- AI chat/history/suggestions/streaming tests passed
- RAG/vector search tests passed
- prompt injection protection tests passed
- detection, mitigation, MITRE mapping, and correlation tests passed

Warnings:
- Duplicate OpenAPI operation ID warnings remain from existing dual route mounting.
- Development JWT secret is short; production must configure `SECRET_KEY`.
- Groq uses local fallback unless `GROQ_API_KEY` is configured.
- Vector layer is local SQL-backed deterministic retrieval, not an external Chroma daemon.

## Future Extension Points
- Replace local embeddings with provider embeddings.
- Move vector documents to Chroma collections.
- Add Redis caching for repeated RAG contexts.
- Add full graph database or normalized relationship tables.
- Add tool execution permissions for live enrichment.
- Add streaming provider passthrough when Groq streaming is enabled.

## Known Limitations
- No external Chroma service is required or verified in local tests.
- Groq network calls are optional and not required for the test suite.
- Correlation uses deterministic metadata matching, not advanced graph ML.
- Generated rules are analyst starting points and require validation before deployment.

## Recommendations For Phase 6
- Implement report generation and export using AI outputs.
- Add notification delivery workflows.
- Add monitoring dashboards and production observability.
- Add CI/CD and deployment manifests.
- Add production Chroma and Redis integration tests.
