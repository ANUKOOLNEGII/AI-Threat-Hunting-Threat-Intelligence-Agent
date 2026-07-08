import type {
  MalwareItem,
  RansomwareCampaign,
  PhishingDomain,
  PhishingEmail,
  CorrelationNode,
  CorrelationLink,
} from '../types/intel.types';

export const MOCK_MALWARE: MalwareItem[] = [
  {
    id: 'mal-1',
    family: 'LockBit v9 Loader',
    severity: 'critical',
    platform: 'Windows Server 2019+',
    sha256: 'b7c3d2e1f0a9876543210987654321098765fedc',
    threatActor: 'LockBit Group',
    firstSeen: '2026-07-04T00:00:00Z',
    lastSeen: '2026-07-08T07:00:00Z',
    confidence: 96,
    status: 'active',
    description: 'Highly evasive scheduler-based ransomware loader targeting High-Integrity scheduled tasks.',
    fileActivity: [
      'C:\\Windows\\System32\\Tasks\\UpdateSchedulerService',
      'C:\\Users\\Public\\Loader.exe'
    ],
    registryKeys: [
      'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Schedule\\TaskCache\\Tasks\\{8F6D-EFEA-1200}'
    ],
    persistenceMechanisms: ['Windows Task Scheduler'],
    networkConnection: 'C2 TOR Channel: lockbit9-c2.onion'
  },
  {
    id: 'mal-2',
    family: 'RedLine Stealer v2',
    severity: 'high',
    platform: 'Windows 10/11',
    sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    threatActor: 'APT29 / Cozy Bear',
    firstSeen: '2026-06-12T00:00:00Z',
    lastSeen: '2026-07-08T01:00:00Z',
    confidence: 88,
    status: 'analyzed',
    description: 'Obfuscated infostealer harvesting credentials from browser local stores and discord sessions.'
  }
];

export const MOCK_RANSOMWARE: RansomwareCampaign[] = [
  {
    id: 'camp-1',
    name: 'Aviation Infrastructure LockDown',
    threatActor: 'LockBit Group',
    victimCount: 14,
    industries: ['Aerospace', 'Logistics'],
    countries: ['USA', 'Poland', 'Germany'],
    firstSeen: '2026-07-01T08:00:00Z',
    lastSeen: '2026-07-08T12:00:00Z',
    initialAccess: 'Exploitation of CVE-2026-34567 CMS vector',
    mitigation: 'Apply patch to AcmeWeb CMS immediately. Limit external outbound TOR access.',
    associatedMalware: ['LockBit v9 Loader'],
    associatedCves: ['CVE-2026-34567']
  }
];

export const MOCK_PHISHING_DOMAINS: PhishingDomain[] = [
  {
    id: 'phish-d1',
    domain: 'c1oudflare-auth.net',
    registrar: 'NameCheap Inc.',
    creationDate: '2026-07-01T00:00:00Z',
    reputation: 'malicious',
    relatedThreats: ['Cloudflare Brand Spoof Phishing'],
    relatedCampaigns: ['SSO Harvest 2026']
  }
];

export const MOCK_PHISHING_EMAILS: PhishingEmail[] = [
  {
    id: 'phish-e1',
    sender: 'security-alert@c1oudflare-auth.net',
    subject: 'Action Required: Re-authenticate your Cloudflare SSO session',
    campaign: 'SSO Harvest 2026',
    urls: ['https://c1oudflare-auth.net/login'],
    attachments: ['CF-Instructions.pdf.exe'],
    indicators: ['c1oudflare-auth.net'],
    receivedDate: '2026-07-04T12:00:00Z'
  }
];

export const MOCK_CORRELATION: { nodes: CorrelationNode[]; links: CorrelationLink[] } = {
  nodes: [
    { id: 'CVE-2026-34567', label: 'CVE-2026-34567', type: 'cve', severity: 'critical' },
    { id: 'LockBit v9 Loader', label: 'LockBit v9 Loader', type: 'malware', severity: 'critical' },
    { id: '185.220.101.47', label: '185.220.101.47', type: 'ioc', severity: 'critical' },
    { id: 'LockBit Group', label: 'LockBit Group', type: 'actor' },
    { id: 'Aviation LockDown', label: 'Aviation LockDown', type: 'campaign' }
  ],
  links: [
    { source: 'CVE-2026-34567', target: 'LockBit v9 Loader', label: 'Exploited by' },
    { source: 'LockBit v9 Loader', target: '185.220.101.47', label: 'Communicates with' },
    { source: 'LockBit Group', target: 'LockBit v9 Loader', label: 'Author of' },
    { source: 'LockBit Group', target: 'Aviation LockDown', label: 'Orchestrated' }
  ]
};

export const intelService = {
  async getMalware(): Promise<MalwareItem[]> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_MALWARE;
  },

  async getMalwareById(id: string): Promise<MalwareItem | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_MALWARE.find((m) => m.id === id) ?? null;
  },

  async getRansomware(): Promise<RansomwareCampaign[]> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_RANSOMWARE;
  },

  async getCampaignById(id: string): Promise<RansomwareCampaign | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_RANSOMWARE.find((c) => c.id === id) ?? null;
  },

  async getPhishingDomains(): Promise<PhishingDomain[]> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_PHISHING_DOMAINS;
  },

  async getPhishingEmails(): Promise<PhishingEmail[]> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_PHISHING_EMAILS;
  },

  async getCorrelation(): Promise<{ nodes: CorrelationNode[]; links: CorrelationLink[] }> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_CORRELATION;
  }
};
