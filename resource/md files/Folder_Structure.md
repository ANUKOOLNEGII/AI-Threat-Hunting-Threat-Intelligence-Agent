PROJECT FOLDER STRUCTURE
AI Threat Hunting & Threat Intelligence Agent
Version 1.0
AI-Threat-Hunting-Agent/
│
├── resource/
│   │
│   ├── PRD.docx
│   ├── TDD.docx
│   ├── FFD.docx
│   ├── BFD.docx
│   ├── API-Documentation.docx
│   ├── Database-Design.docx
│   ├── Security-Architecture.docx
│   ├── Deployment-Guide.docx
│   ├── User-Manual.docx
│   ├── Administrator-Guide.docx
│   │
│   ├── diagrams/
│   │   ├── system-architecture.png
│   │   ├── deployment-diagram.png
│   │   ├── class-diagram.png
│   │   ├── sequence-diagram.png
│   │   ├── activity-diagram.png
│   │   ├── component-diagram.png
│   │   ├── er-diagram.png
│   │   ├── database-schema.png
│   │   ├── ai-agent-workflow.png
│   │   ├── langchain-flow.png
│   │   ├── threat-pipeline.png
│   │   ├── security-architecture.png
│   │   ├── deployment-workflow.png
│   │   ├── kubernetes-architecture.png
│   │   └── dfd/
│   │       ├── level-0.png
│   │       ├── level-1.png
│   │       ├── level-2.png
│   │       └── level-3.png
│
├── frontend/
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   ├── robots.txt
│   │   └── images/
│   │       ├── logos/
│   │       ├── icons/
│   │       ├── dashboard/
│   │       └── illustrations/
│   │
│   ├── src/
│   │   │
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── routes.tsx
│   │   │   ├── providers.tsx
│   │   │   └── store.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Dashboard/
│   │   │   ├── ThreatFeed/
│   │   │   ├── CVEExplorer/
│   │   │   ├── IOCExplorer/
│   │   │   ├── MalwareAnalysis/
│   │   │   ├── RansomwareMonitor/
│   │   │   ├── PhishingDashboard/
│   │   │   ├── ThreatCorrelation/
│   │   │   ├── ThreatActors/
│   │   │   ├── ATTACKNavigator/
│   │   │   ├── AIChat/
│   │   │   ├── Reports/
│   │   │   ├── Notifications/
│   │   │   ├── Settings/
│   │   │   ├── Profile/
│   │   │   ├── Admin/
│   │   │   └── ErrorPages/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── auth/
│   │   │   ├── threat/
│   │   │   ├── cve/
│   │   │   ├── ioc/
│   │   │   ├── malware/
│   │   │   ├── ransomware/
│   │   │   ├── phishing/
│   │   │   ├── ai/
│   │   │   ├── reports/
│   │   │   ├── notifications/
│   │   │   ├── charts/
│   │   │   ├── tables/
│   │   │   └── admin/
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── threat.service.ts
│   │   │   ├── cve.service.ts
│   │   │   ├── ioc.service.ts
│   │   │   ├── malware.service.ts
│   │   │   ├── ransomware.service.ts
│   │   │   ├── phishing.service.ts
│   │   │   ├── report.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── ai.service.ts
│   │   │   └── admin.service.ts
│   │   │
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── redux/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── assets/
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   ├── agents/
│   │   │   ├── feed_collector/
│   │   │   ├── normalization/
│   │   │   ├── cve_intelligence/
│   │   │   ├── ioc_analysis/
│   │   │   ├── malware_analysis/
│   │   │   ├── phishing_analysis/
│   │   │   ├── threat_correlation/
│   │   │   ├── ai_reasoning/
│   │   │   ├── detection_generation/
│   │   │   ├── mitigation_generation/
│   │   │   └── report_generator/
│   │   │
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── middleware/
│   │   ├── security/
│   │   ├── database/
│   │   ├── workers/
│   │   ├── scheduler/
│   │   ├── prompts/
│   │   ├── integrations/
│   │   │   ├── nvd/
│   │   │   ├── misp/
│   │   │   ├── virustotal/
│   │   │   ├── shodan/
│   │   │   ├── attack/
│   │   │   ├── cisa/
│   │   │   ├── otx/
│   │   │   └── groq/
│   │   │
│   │   ├── ai/
│   │   │   ├── langchain/
│   │   │   ├── rag/
│   │   │   ├── embeddings/
│   │   │   ├── memory/
│   │   │   └── tools/
│   │   │
│   │   ├── utils/
│   │   ├── config/
│   │   ├── logs/
│   │   └── uploads/
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── api/
│   │   ├── security/
│   │   ├── ai/
│   │   ├── performance/
│   │   └── e2e/
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── databases/
│   ├── postgresql/
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   └── seed.sql
│   │
│   ├── mongodb/
│   │   ├── collections/
│   │   └── indexes/
│   │
│   ├── redis/
│   └── chromadb/
│
├── deployment/
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   ├── nginx/
│   ├── github-actions/
│   ├── helm/
│   └── monitoring/
│
├── monitoring/
│   ├── prometheus/
│   ├── grafana/
│   ├── alertmanager/
│   └── exporters/
│
├── logging/
│   ├── elasticsearch/
│   ├── kibana/
│   ├── logstash/
│   └── filebeat/
│
├── scripts/
│   ├── setup.sh
│   ├── run-dev.sh
│   ├── seed.sh
│   ├── backup.sh
│   ├── restore.sh
│   ├── deploy.sh
│   └── cleanup.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       ├── security-scan.yml
│       └── dependency-check.yml
│
├── docs/
├── LICENSE
├── README.md
├── CONTRIBUTING.md
├── docker-compose.yml
├── .gitignore
└── .env.example
Database Collections / Tables
PostgreSQL

users
roles
permissions
threat_reports
cves
iocs
malware
ransomware_campaigns
phishing_campaigns
threat_feeds
threat_actors
detection_rules
mitigations
notifications
audit_logs
scheduler_jobs
api_logs
user_sessions

MongoDB

ThreatArticles
ThreatReports
ThreatActors
MalwareReports
ThreatCorrelation
AIConversation
FeedHistory
SecurityBlogs
PhishingEmails
IOCCollection
VendorAdvisories
MITREMappings
Technology Alignment
Frontend
React.js
TypeScript
Redux Toolkit
Tailwind CSS
Material UI
Axios
React Router
Recharts

Backend
Python
FastAPI
SQLAlchemy
Celery
Redis
Pydantic

AI Layer
LangChain
Groq API
Llama 3
RAG
ChromaDB

Threat Intelligence
NVD
CISA KEV
VirusTotal
Shodan
MISP
MITRE ATT&CK
AlienVault OTX
GitHub Security Advisories

Databases
PostgreSQL
MongoDB
Redis
ChromaDB

Deployment
Docker
Kubernetes
NGINX
GitHub Actions
Prometheus
Grafana
ELK Stack
Terraform
This folder structure is fully aligned with the architecture and modules described in your PRD and TDD, including the multi-agent AI workflow, frontend and backend modules, databases, deployment, testing, monitoring, and DevOps organization.




