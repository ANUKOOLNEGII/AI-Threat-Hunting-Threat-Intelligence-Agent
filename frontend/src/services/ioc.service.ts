import type { IOCItem, IOCFilters } from '../types/ioc.types';

export const MOCK_IOCS: IOCItem[] = [
  {
    id: 'ioc-1',
    value: '185.220.101.47',
    type: 'ip',
    reputation: 'malicious',
    confidence: 95,
    source: 'CISA KEV',
    threatCount: 3,
    firstSeen: '2026-07-01T08:00:00Z',
    lastSeen: '2026-07-08T12:00:00Z',
    status: 'active',
    description: 'Active C2 node communicating with LockBit v9 malware loaders. Tor exit node configuration detected.',
    whois: {
      domain: '185.220.101.47',
      registrar: 'RIPE NCC',
      creationDate: '2018-05-12T00:00:00Z',
      expirationDate: '2028-05-12T00:00:00Z',
      country: 'Germany',
      organization: 'Tor Exit Operator Group'
    },
    timeline: [
      { id: 't1', timestamp: '2026-07-01T08:00:00Z', title: 'IOC First Seen', description: 'C2 traffic patterns first logged on border routers.', type: 'first-seen' },
      { id: 't2', timestamp: '2026-07-04T10:00:00Z', title: 'Threat Correlated', description: 'Matched against LockBit payload beaconing profiles.', type: 'correlated' },
      { id: 't3', timestamp: '2026-07-08T12:00:00Z', title: 'Investigation Created', description: 'Flagged for security operations triage.', type: 'investigated' }
    ],
    relationships: [
      { targetId: 'threat-002', targetType: 'threat', targetLabel: 'LockBit v9 Loader', relationType: 'C2 Infrastructure', confidence: 95 },
      { targetId: 'cve-2026-34567', targetType: 'cve', targetLabel: 'CVE-2026-34567', relationType: 'Exploited Via', confidence: 90 }
    ],
    externalIntel: [
      { sourceName: 'VirusTotal', score: '67/90 malicious', status: 'malicious', lastChecked: '2026-07-08T11:00:00Z' },
      { sourceName: 'Shodan', score: 'Ports 80, 443 open', status: 'suspicious', lastChecked: '2026-07-08T10:00:00Z' }
    ]
  },
  {
    id: 'ioc-2',
    value: 'acmeweb-exploit.baddomain.io',
    type: 'domain',
    reputation: 'malicious',
    confidence: 90,
    source: 'Internal Intel',
    threatCount: 2,
    firstSeen: '2026-07-05T10:00:00Z',
    lastSeen: '2026-07-08T11:30:00Z',
    status: 'investigating',
    description: 'Host domain for payload distribution files matching CVE-2026-34567 exploitations.',
    whois: {
      domain: 'acmeweb-exploit.baddomain.io',
      registrar: 'NameCheap Inc.',
      creationDate: '2026-06-20T00:00:00Z',
      expirationDate: '2027-06-20T00:00:00Z',
      country: 'Panama',
      organization: 'Privacy Services Protected'
    },
    timeline: [
      { id: 't4', timestamp: '2026-07-05T10:00:00Z', title: 'IOC First Seen', description: 'Domain registered and immediate exploit hosting detected.', type: 'first-seen' }
    ],
    relationships: [
      { targetId: 'threat-001', targetType: 'threat', targetLabel: 'CVE-2026-34567 AcmeWeb RCE', relationType: 'Hosts Payload', confidence: 92 }
    ],
    externalIntel: [
      { sourceName: 'VirusTotal', score: '54/90 malicious', status: 'malicious', lastChecked: '2026-07-08T11:15:00Z' }
    ]
  },
  {
    id: 'ioc-3',
    value: 'a3f2c1d4e5b6789012345678901234567890abcd',
    type: 'sha256',
    reputation: 'malicious',
    confidence: 100,
    source: 'NIST NVD',
    threatCount: 1,
    firstSeen: '2026-07-07T09:00:00Z',
    lastSeen: '2026-07-07T09:00:00Z',
    status: 'mitigated',
    description: 'Payload hash for AcmeWeb CMS media upload backdoor exploit file.',
    timeline: [
      { id: 't5', timestamp: '2026-07-07T09:00:00Z', title: 'IOC First Seen', description: 'Hash published in vulnerability report.', type: 'first-seen' }
    ],
    relationships: [
      { targetId: 'threat-001', targetType: 'threat', targetLabel: 'CVE-2026-34567 AcmeWeb RCE', relationType: 'Exploit Payload', confidence: 100 }
    ],
    externalIntel: [
      { sourceName: 'VirusTotal', score: '90/90 malicious', status: 'malicious', lastChecked: '2026-07-08T08:00:00Z' }
    ]
  },
  {
    id: 'ioc-4',
    value: 'secure-acmecorp.com',
    type: 'domain',
    reputation: 'trusted',
    confidence: 100,
    source: 'Internal Intel',
    threatCount: 0,
    firstSeen: '2026-01-01T00:00:00Z',
    lastSeen: '2026-07-08T12:00:00Z',
    status: 'whitelist',
    description: 'Legitimate corporate domain for operations. Whitelisted to prevent false positives.'
  }
];

export const iocService = {
  async getIocs(
    filters: IOCFilters,
    page = 1,
    pageSize = 10
  ): Promise<{ items: IOCItem[]; total: number; page: number; pageSize: number }> {
    await new Promise((r) => setTimeout(r, 600));

    let results = [...MOCK_IOCS];

    // Filter Query
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (i) =>
          i.value.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
      );
    }

    // Filter Type
    if (filters.type !== 'all') {
      results = results.filter((i) => i.type === filters.type);
    }

    // Filter Reputation
    if (filters.reputation !== 'all') {
      results = results.filter((i) => i.reputation === filters.reputation);
    }

    // Filter Status
    if (filters.status !== 'all') {
      results = results.filter((i) => i.status === filters.status);
    }

    // Sorting
    results.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case 'value':
          cmp = a.value.localeCompare(b.value);
          break;
        case 'reputation':
          cmp = a.reputation.localeCompare(b.reputation);
          break;
        case 'confidence':
          cmp = a.confidence - b.confidence;
          break;
        case 'lastSeen':
          cmp = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
          break;
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    const total = results.length;
    const start = (page - 1) * pageSize;
    return { items: results.slice(start, start + pageSize), total, page, pageSize };
  },

  async getIocById(id: string): Promise<IOCItem | null> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_IOCS.find((i) => i.id === id) ?? null;
  }
};
