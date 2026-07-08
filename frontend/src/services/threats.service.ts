/* ============================================================
   Threat Intelligence — Mock Service
   Provides realistic mock data. Replace with real API calls.
   ============================================================ */
import type {
  ThreatItem,
  ThreatFilters,
  ThreatSeverity,
} from '../types/threat.types';

/* ── Mock dataset ─────────────────────────────────────────── */
export const MOCK_THREATS: ThreatItem[] = [
  {
    id: 'threat-001',
    title: 'CVE-2026-34567 — AcmeWeb CMS Remote Code Execution',
    summary:
      'A path traversal flaw in AcmeWeb CMS v4.2 allows unauthenticated RCE via crafted HTTP headers. CVSS 9.8.',
    category: 'vulnerability',
    severity: 'critical',
    status: 'active',
    source: { name: 'NIST NVD', type: 'nvd', url: 'https://nvd.nist.gov' },
    publishedAt: '2026-07-07T09:15:00Z',
    updatedAt: '2026-07-08T04:30:00Z',
    tags: [
      { id: 't1', label: 'RCE', color: 'red' },
      { id: 't2', label: 'CMS', color: 'blue' },
      { id: 't3', label: 'CVSS 9.8', color: 'red' },
    ],
    description:
      'AcmeWeb CMS version 4.2 is vulnerable to path traversal attacks through the media upload endpoint. Attackers can traverse to arbitrary system files and execute OS commands with web server privileges. No authentication is required.',
    affectedVendor: 'AcmeWeb Corp',
    affectedProduct: 'AcmeWeb CMS v4.2',
    cvssScore: 9.8,
    aiConfidenceScore: 97,
    referenceIds: ['CVE-2026-34567', 'CISA-KEV-2026-0112'],
    timeline: [
      { id: 'ev1', timestamp: '2026-07-05T12:00:00Z', title: 'Vulnerability Reported', description: 'Security researcher submitted initial PoC to vendor.', type: 'published' },
      { id: 'ev2', timestamp: '2026-07-06T08:00:00Z', title: 'Feed Collected', description: 'NVD indexed the advisory. CISA KEV catalog updated.', type: 'collected' },
      { id: 'ev3', timestamp: '2026-07-07T09:15:00Z', title: 'Analysis Started', description: 'Internal SOC triage commenced. Severity confirmed Critical.', type: 'analyzed' },
      { id: 'ev4', timestamp: '2026-07-08T04:30:00Z', title: 'Intelligence Updated', description: 'Active exploitation observed in Aerospace sector.', type: 'updated' },
    ],
    iocRefs: [
      { type: 'ip', value: '185.220.101.47' },
      { type: 'domain', value: 'acmeweb-exploit.baddomain.io' },
      { type: 'hash', value: 'a3f2c1d4e5b6789012345678901234567890abcd' },
    ],
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2026-34567',
      'https://www.cisa.gov/known-exploited-vulnerabilities',
    ],
  },
  {
    id: 'threat-002',
    title: 'LockBit v9 — Evasive Scheduler Ransomware Loader',
    summary:
      'New LockBit v9 variant abuses Windows Task Scheduler for persistence. Observed in financial and logistics sectors.',
    category: 'ransomware',
    severity: 'high',
    status: 'investigating',
    source: { name: 'CISA KEV', type: 'cisa', url: 'https://cisa.gov' },
    publishedAt: '2026-07-06T14:00:00Z',
    updatedAt: '2026-07-08T07:00:00Z',
    tags: [
      { id: 't4', label: 'Ransomware', color: 'red' },
      { id: 't5', label: 'LockBit', color: 'purple' },
      { id: 't6', label: 'Persistence', color: 'yellow' },
    ],
    description:
      'LockBit v9 introduces a novel persistence mechanism using Windows Task Scheduler with high-integrity tasks. The payload is encrypted with a per-victim key and uses a custom TOR-based C2 channel.',
    affectedVendor: 'Multiple',
    affectedProduct: 'Windows Server 2019+',
    cvssScore: 8.4,
    aiConfidenceScore: 89,
    referenceIds: ['LockBit-v9-IOC-2026'],
    timeline: [
      { id: 'ev5', timestamp: '2026-07-04T00:00:00Z', title: 'First Observed', description: 'Variant first observed in Eastern European financial institution breach.', type: 'published' },
      { id: 'ev6', timestamp: '2026-07-06T14:00:00Z', title: 'Feed Collected', description: 'CISA issued emergency advisory. IOC list published.', type: 'collected' },
      { id: 'ev7', timestamp: '2026-07-07T10:00:00Z', title: 'Investigation Escalated', description: 'Multiple sector reports confirmed. Severity elevated to High.', type: 'escalated' },
    ],
    iocRefs: [
      { type: 'hash', value: 'b7c3d2e1f0a9876543210987654321098765fedc' },
      { type: 'domain', value: 'lockbit9-c2.onion' },
    ],
    references: ['https://www.cisa.gov/news-events/cybersecurity-advisories/aa26-001a'],
  },
  {
    id: 'threat-003',
    title: 'Cl0p Data Exfiltration — ERP Endpoint Exploit',
    summary:
      'Cl0p threat actors deploying custom exfil scripts targeting SAP and Oracle ERP REST endpoints.',
    category: 'apt',
    severity: 'high',
    status: 'active',
    source: { name: 'Community Intel', type: 'community' },
    publishedAt: '2026-07-05T18:00:00Z',
    updatedAt: '2026-07-07T22:00:00Z',
    tags: [
      { id: 't7', label: 'APT', color: 'purple' },
      { id: 't8', label: 'Exfiltration', color: 'red' },
      { id: 't9', label: 'ERP', color: 'blue' },
    ],
    description:
      'Cl0p has pivoted to targeting enterprise ERP REST APIs after initial access through phishing. Custom Python exfiltration scripts compress and encrypt data before transmitting to attacker infrastructure.',
    affectedVendor: 'SAP, Oracle',
    affectedProduct: 'SAP S/4HANA, Oracle EBS',
    cvssScore: 7.8,
    aiConfidenceScore: 82,
    referenceIds: ['Cl0p-ERP-2026-Q3'],
    timeline: [
      { id: 'ev8', timestamp: '2026-07-03T08:00:00Z', title: 'Initial Report', description: 'Community researcher observed Cl0p infrastructure shift.', type: 'published' },
      { id: 'ev9', timestamp: '2026-07-05T18:00:00Z', title: 'Feed Collected', description: 'IOC list shared across community threat sharing platforms.', type: 'collected' },
    ],
    iocRefs: [
      { type: 'ip', value: '91.205.188.24' },
      { type: 'url', value: 'https://evil-exfil.baddomain.ru/upload' },
    ],
    references: [],
  },
  {
    id: 'threat-004',
    title: 'CVE-2026-11234 — Apache Struts2 OGNL Injection',
    summary:
      'Critical OGNL injection in Apache Struts2 allows pre-auth RCE. Patch available in 6.8.2.',
    category: 'vulnerability',
    severity: 'critical',
    status: 'new',
    source: { name: 'NIST NVD', type: 'nvd' },
    publishedAt: '2026-07-08T06:00:00Z',
    updatedAt: '2026-07-08T06:00:00Z',
    tags: [
      { id: 't10', label: 'OGNL', color: 'red' },
      { id: 't11', label: 'Apache', color: 'yellow' },
      { id: 't12', label: 'Zero-Day', color: 'red' },
    ],
    cvssScore: 9.3,
    aiConfidenceScore: 95,
    referenceIds: ['CVE-2026-11234'],
    timeline: [
      { id: 'ev10', timestamp: '2026-07-08T06:00:00Z', title: 'NVD Published', description: 'NVD published advisory for Struts2 OGNL injection flaw.', type: 'published' },
    ],
  },
  {
    id: 'threat-005',
    title: 'Mass Phishing Campaign — Cloudflare Brand Spoof',
    summary:
      'Large-scale credential harvesting using spoofed Cloudflare login pages targeting enterprise SSO users.',
    category: 'phishing',
    severity: 'medium',
    status: 'active',
    source: { name: 'Internal Intel', type: 'internal' },
    publishedAt: '2026-07-04T12:00:00Z',
    updatedAt: '2026-07-08T01:00:00Z',
    tags: [
      { id: 't13', label: 'Phishing', color: 'yellow' },
      { id: 't14', label: 'Credential Harvest', color: 'red' },
      { id: 't15', label: 'SSO', color: 'blue' },
    ],
    cvssScore: 5.4,
    aiConfidenceScore: 74,
    iocRefs: [
      { type: 'domain', value: 'c1oudflare-auth.net' },
      { type: 'email', value: 'noreply@c1oudflare-auth.net' },
    ],
  },
  {
    id: 'threat-006',
    title: 'Supply Chain — npm Package Typosquatting',
    summary:
      'Malicious npm packages mimicking popular UI libraries include obfuscated data-stealing payloads.',
    category: 'malware',
    severity: 'medium',
    status: 'closed',
    source: { name: 'Vendor Advisory', type: 'vendor' },
    publishedAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-03T16:00:00Z',
    tags: [
      { id: 't16', label: 'Supply Chain', color: 'purple' },
      { id: 't17', label: 'npm', color: 'green' },
      { id: 't18', label: 'Stealer', color: 'red' },
    ],
    cvssScore: 6.1,
    aiConfidenceScore: 91,
  },
];

/* ── Severity ordering for sort ─────────────────────────── */
const SEVERITY_ORDER: Record<ThreatSeverity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  informational: 1,
};

/* ── Service methods ─────────────────────────────────────── */
export const threatsService = {
  /** Simulates a paginated feed fetch with filtering */
  async getThreats(
    filters: ThreatFilters,
    page = 1,
    pageSize = 10
  ): Promise<{ items: ThreatItem[]; total: number; page: number; pageSize: number }> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));

    let results = [...MOCK_THREATS];

    // Query filter
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.label.toLowerCase().includes(q))
      );
    }

    // Severity filter
    if (filters.severity !== 'all') {
      results = results.filter((t) => t.severity === filters.severity);
    }

    // Category filter
    if (filters.category !== 'all') {
      results = results.filter((t) => t.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      results = results.filter((t) => t.status === filters.status);
    }

    // Source filter
    if (filters.source !== 'all') {
      results = results.filter((t) => t.source.name === filters.source);
    }

    // Sorting
    results.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case 'publishedAt':
          cmp = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          break;
        case 'updatedAt':
          cmp = new Date(a.updatedAt ?? a.publishedAt).getTime() - new Date(b.updatedAt ?? b.publishedAt).getTime();
          break;
        case 'severity':
          cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    const total = results.length;
    const start = (page - 1) * pageSize;
    return { items: results.slice(start, start + pageSize), total, page, pageSize };
  },

  /** Fetches a single threat by ID */
  async getThreatById(id: string): Promise<ThreatItem | null> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_THREATS.find((t) => t.id === id) ?? null;
  },
};
