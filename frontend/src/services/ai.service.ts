import type { AIConversation, AIMessage, AIReference, AIResponseSections } from '../types/ai.types';

/* ---- Mock references ---- */

const MOCK_REFS: AIReference[] = [
  { id: 'r1', source: 'NVD',           title: 'National Vulnerability Database',          url: 'https://nvd.nist.gov',                    relevance: 'high' },
  { id: 'r2', source: 'MITRE',          title: 'MITRE ATT&CK Framework',                   url: 'https://attack.mitre.org',                relevance: 'high' },
  { id: 'r3', source: 'CISA',           title: 'CISA Known Exploited Vulnerabilities',      url: 'https://cisa.gov/known-exploited',        relevance: 'high' },
  { id: 'r4', source: 'VirusTotal',     title: 'VirusTotal Intelligence',                   url: 'https://virustotal.com',                  relevance: 'medium' },
  { id: 'r5', source: 'Shodan',         title: 'Shodan Internet Exposure Database',         url: 'https://shodan.io',                       relevance: 'medium' },
  { id: 'r6', source: 'MISP',           title: 'MISP Threat Intelligence Platform',         url: 'https://misp-project.org',                relevance: 'low' },
  { id: 'r7', source: 'Vendor Advisory',title: 'Vendor Security Advisories',               url: 'https://security.microsoft.com/advisories', relevance: 'high' },
];

/* ---- Canned AI response sections ---- */

function buildSections(prompt: string): AIResponseSections {
  const lower = prompt.toLowerCase();

  if (lower.includes('lockbit')) return {
    executiveSummary: 'LockBit v9 is a sophisticated ransomware-as-a-service (RaaS) operation with observed activity targeting critical infrastructure sectors including aerospace, logistics, and healthcare across NATO member states.',
    technicalAnalysis: 'The loader leverages **Windows Task Scheduler** for high-integrity persistence via SDDL-controlled tasks. After initial access through CVE-2026-34567, it deploys a TOR-based C2 channel (`lockbit9-c2.onion`) for command exfiltration. The payload uses AES-256 + RSA-4096 hybrid encryption across all writable drives.',
    threatClassification: 'Ransomware · RaaS · APT-Adjacent · Critical Infrastructure',
    riskAssessment: '**Critical — CVSS 9.8**. Active exploitation confirmed. Immediate patching required. Organizations in aerospace and logistics sectors at highest risk.',
    recommendations: [
      'Apply emergency patch to AcmeWeb CMS (CVE-2026-34567) immediately.',
      'Block outbound TOR traffic at perimeter and proxy layer.',
      'Enable Windows Defender ASR rules for Task Scheduler abuse.',
      'Deploy YARA rule: `lockbit9_loader_task_v2` on all endpoints.',
      'Review and audit all Windows Scheduled Tasks for unauthorized entries.',
      'Segment aviation/logistics network segments with micro-perimeters.',
    ],
    mitreReference: 'T1053.005 (Scheduled Task/Job) · T1041 (Exfiltration over C2 Channel) · T1486 (Data Encrypted for Impact)',
    detectionRule: `title: LockBit v9 Loader Scheduled Task Persistence
status: experimental
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4698
    TaskName|contains: 'UpdateSchedulerService'
  condition: selection
falsepositives:
  - Legitimate update schedulers with matching names
level: critical`,
  };

  if (lower.includes('cve') || lower.includes('vulnerabilit')) return {
    executiveSummary: 'Analysis of current critical CVE landscape reveals 3 zero-day vulnerabilities with active exploitation in the wild across enterprise web application frameworks and VPN concentrators.',
    technicalAnalysis: '**CVE-2026-34567** (CVSS 9.8): Remote code execution in AcmeWeb CMS via unauthenticated deserialization. **CVE-2026-11223** (CVSS 9.1): Authentication bypass in FortiOS SSL-VPN. Both are in the CISA KEV catalog with confirmed threat actor exploitation.',
    threatClassification: 'Zero-Day · Remote Code Execution · Authentication Bypass · Critical Priority',
    riskAssessment: '**Critical**. Two CVEs are confirmed in-the-wild exploitation. Patch SLAs should be reduced to 24 hours for affected systems.',
    recommendations: [
      'Prioritize CVE-2026-34567 patching — AcmeWeb CMS deployments.',
      'Apply FortiOS hotfix for CVE-2026-11223 immediately.',
      'Enable IDS/IPS signatures for both CVEs on perimeter devices.',
      'Audit internet-facing CMS and VPN deployments.',
    ],
    mitreReference: 'T1190 (Exploit Public-Facing Application) · T1133 (External Remote Services)',
  };

  if (lower.includes('phishing') || lower.includes('sso')) return {
    executiveSummary: 'The SSO Harvest 2026 phishing campaign impersonates Cloudflare authentication portals to harvest enterprise SSO credentials. Over 2,400 unique targets identified across financial and technology sectors.',
    technicalAnalysis: 'Attackers registered `c1oudflare-auth.net` via NameCheap on 2026-07-01 using a lookalike typosquat. Emails originate from `security-alert@c1oudflare-auth.net` with subject "Action Required: Re-authenticate your Cloudflare SSO session". Attachment `CF-Instructions.pdf.exe` drops a credential harvesting payload.',
    threatClassification: 'Credential Harvesting · Brand Impersonation · Spear Phishing',
    riskAssessment: '**High**. Active campaign with confirmed credential theft. Immediate user awareness advisory required.',
    recommendations: [
      'Block domain `c1oudflare-auth.net` at DNS and proxy layer.',
      'Alert users to report suspicious Cloudflare re-authentication emails.',
      'Enable DMARC strict enforcement on all corporate domains.',
      'Deploy email gateway rule to block .pdf.exe double-extension attachments.',
    ],
    mitreReference: 'T1566.001 (Spearphishing Attachment) · T1598 (Phishing for Information)',
  };

  if (lower.includes('ioc') || lower.includes('185.220')) return {
    executiveSummary: 'IOC 185.220.101.47 is a known Tor exit node and active C2 relay associated with ransomware groups including LockBit and Cl0p. It appears across 14 threat intelligence feeds with a malicious reputation score of 97/100.',
    technicalAnalysis: 'IP geolocation: Frankfurt, Germany (AS205100 - F3 Netze). First observed: 2026-04-12. Last seen: 2026-07-08. Open ports: 443/tcp, 9001/tcp (Tor relay), 9030/tcp (Tor directory). Associated with 4 active C2 campaigns.',
    threatClassification: 'C2 Infrastructure · Tor Exit Node · High Confidence Malicious',
    riskAssessment: '**Critical**. Any outbound communication to this IP indicates active compromise. Immediate incident response required.',
    recommendations: [
      'Block 185.220.101.47 at all network perimeters immediately.',
      'Search SIEM for any historical connections to this IP.',
      'Isolate any endpoints that communicated with this IP for forensic investigation.',
      'Report to your ISP and CISA if confirmed C2 traffic observed.',
    ],
    mitreReference: 'T1090.003 (Multi-hop Proxy) · T1071.001 (Web Protocols) · T1041 (Exfiltration over C2)',
  };

  // General fallback
  return {
    executiveSummary: 'Based on current threat intelligence data, I have analyzed your query and compiled findings from multiple authoritative sources including NVD, MITRE ATT&CK, CISA, and active threat feeds.',
    technicalAnalysis: 'The threat landscape continues to evolve with ransomware-as-a-service operations expanding their targeting scope. Active campaigns show increased focus on supply chain attacks and critical infrastructure sectors.',
    threatClassification: 'General Threat Intelligence · Enterprise Risk',
    riskAssessment: '**Medium-High**. Continuous monitoring recommended. Review flagged indicators and apply recommended mitigations.',
    recommendations: [
      'Maintain up-to-date threat intelligence feeds.',
      'Ensure all critical systems are patched within defined SLAs.',
      'Conduct regular threat hunting exercises across endpoint telemetry.',
      'Review and test incident response playbooks quarterly.',
    ],
  };
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

/* ============================================================
   AI Service
   ============================================================ */

export const aiService = {
  async createConversation(title?: string): Promise<AIConversation> {
    await new Promise((r) => setTimeout(r, 100));
    const id = generateId();
    return {
      id,
      title: title ?? 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      messages: [],
    };
  },

  async generateResponse(prompt: string): Promise<AIMessage> {
    // Simulate AI latency (1.8–2.5s)
    await new Promise((r) => setTimeout(r, 1800 + Math.random() * 700));

    const sections = buildSections(prompt);
    const content = [
      `## Executive Summary\n${sections.executiveSummary}`,
      `## Technical Analysis\n${sections.technicalAnalysis}`,
      sections.threatClassification ? `## Threat Classification\n${sections.threatClassification}` : '',
      sections.riskAssessment ? `## Risk Assessment\n${sections.riskAssessment}` : '',
      sections.recommendations?.length
        ? `## Recommendations\n${sections.recommendations.map((r) => `- ${r}`).join('\n')}`
        : '',
      sections.mitreReference ? `## MITRE ATT&CK\n\`${sections.mitreReference}\`` : '',
      sections.detectionRule ? `## Detection Rule\n\`\`\`yaml\n${sections.detectionRule}\n\`\`\`` : '',
    ].filter(Boolean).join('\n\n');

    const score = 75 + Math.floor(Math.random() * 22);
    const level = score >= 90 ? 'very-high' : score >= 75 ? 'high' : score >= 55 ? 'medium' : 'low';

    return {
      id: generateId(),
      role: 'assistant',
      content,
      status: 'complete',
      timestamp: new Date().toISOString(),
      confidence: level,
      confidenceScore: score,
      sections,
      references: MOCK_REFS.slice(0, 4 + Math.floor(Math.random() * 3)),
    };
  },

  async exportConversation(conv: AIConversation): Promise<string> {
    const lines = [
      `# AI Analyst Conversation Export`,
      `**Title:** ${conv.title}`,
      `**Exported:** ${new Date().toLocaleString()}`,
      `**Messages:** ${conv.messageCount}`,
      '',
      '---',
      '',
      ...conv.messages.map((m) => [
        `### ${m.role === 'user' ? '👤 Analyst' : '🤖 AI Assistant'} — ${new Date(m.timestamp).toLocaleString()}`,
        m.content,
        '',
      ].join('\n')),
    ];
    return lines.join('\n');
  },
};
