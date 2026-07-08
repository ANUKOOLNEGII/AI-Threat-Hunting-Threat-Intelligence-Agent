import type { CVEItem, CVEFilters } from '../types/cve.types';

export const MOCK_CVES: CVEItem[] = [
  {
    cveId: 'CVE-2026-34567',
    title: 'AcmeWeb CMS Path Traversal Vulnerability',
    description: 'A path traversal vulnerability in AcmeWeb CMS v4.2 allows unauthenticated remote code execution via specially crafted HTTP headers.',
    vendor: 'AcmeWeb Corp',
    product: 'AcmeWeb CMS',
    cvssScore: 9.8,
    severity: 'critical',
    isExploited: true,
    publishedDate: '2026-07-07T09:15:00Z',
    updatedDate: '2026-07-08T04:30:00Z',
    cvssMetrics: {
      score: 9.8,
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      accessVector: 'Network',
      accessComplexity: 'Low',
      authentication: 'None',
      confidentialityImpact: 'High',
      integrityImpact: 'High',
      availabilityImpact: 'High'
    },
    detectionRules: [
      {
        id: 'rule-1',
        type: 'sigma',
        title: 'AcmeWeb Path Traversal Exploit Attempt',
        content: 'title: AcmeWeb Path Traversal Exploit Attempt\nstatus: active\ndescription: Detects path traversal attempts in AcmeWeb CMS\nlogsource:\n  category: webserver\ndetection:\n  selection:\n    c-uri|contains: \'/uploads/media/\'\n    c-headers|contains: \'../\'\n  condition: selection'
      },
      {
        id: 'rule-2',
        type: 'yara',
        title: 'AcmeWeb CMS Exploit Signature',
        content: 'rule AcmeWeb_Exploit {\n  meta:\n    description = "Detects AcmeWeb path traversal payload"\n  strings:\n    $payload = "media/../../etc/passwd"\n  condition:\n    any of them\n}'
      }
    ],
    mitigation: {
      patchUrl: 'https://acmeweb.com/patches/v4.2.1',
      workaround: 'Disable the media upload endpoint in configuration files if not in use.',
      firewallRecommendation: 'Deploy WAF rule blocking URL paths containing sequence "../".',
      edrRecommendation: 'Monitor for suspicious child processes of the web server process (e.g. cmd.exe, sh, bash).',
      networkSegmentation: 'Segment the web server network from internal databases.'
    },
    mitreAttack: [
      {
        techniqueId: 'T1190',
        techniqueName: 'Exploit Public-Facing Application',
        tactic: 'Initial Access',
        description: 'Adversaries may attempt to exploit a vulnerability in a public-facing application to gain access.'
      }
    ],
    references: [
      { source: 'NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-34567' },
      { source: 'CISA KEV', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' }
    ],
    relatedCves: ['CVE-2025-89123']
  },
  {
    cveId: 'CVE-2026-11234',
    title: 'Apache Struts2 OGNL Injection',
    description: 'Critical OGNL injection in Apache Struts2 allows pre-authentication remote code execution. Attackers can exploit this via custom content types.',
    vendor: 'Apache Software Foundation',
    product: 'Struts2',
    cvssScore: 9.3,
    severity: 'critical',
    isExploited: true,
    publishedDate: '2026-07-08T06:00:00Z',
    updatedDate: '2026-07-08T06:00:00Z',
    cvssMetrics: {
      score: 9.3,
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      accessVector: 'Network',
      accessComplexity: 'Low',
      authentication: 'None',
      confidentialityImpact: 'High',
      integrityImpact: 'High',
      availabilityImpact: 'High'
    },
    mitigation: {
      patchUrl: 'https://struts.apache.org/download.cgi',
      workaround: 'Update struts2-core libraries immediately to version 6.8.2.'
    },
    references: [
      { source: 'NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-11234' }
    ]
  },
  {
    cveId: 'CVE-2026-44444',
    title: 'Microsoft Windows Kernel Privilege Escalation',
    description: 'An elevation of privilege vulnerability in the Windows Kernel allows a local attacker to execute arbitrary code with SYSTEM privileges.',
    vendor: 'Microsoft',
    product: 'Windows 11',
    cvssScore: 7.8,
    severity: 'high',
    isExploited: false,
    publishedDate: '2026-06-15T18:00:00Z',
    updatedDate: '2026-06-18T10:00:00Z',
    cvssMetrics: {
      score: 7.8,
      vectorString: 'CVSS:3.1/AV:L/AC:H/PR:L/UI:N/S:C/C:H/I:H/A:H',
      accessVector: 'Local',
      accessComplexity: 'High',
      authentication: 'Single',
      confidentialityImpact: 'High',
      integrityImpact: 'High',
      availabilityImpact: 'High'
    },
    mitigation: {
      patchUrl: 'https://msrc.microsoft.com/update-guide',
      workaround: 'Limit administrative privileges and enforce strict app control policies.'
    },
    references: [
      { source: 'Microsoft MSRC', url: 'https://msrc.microsoft.com/update-guide' }
    ]
  },
  {
    cveId: 'CVE-2026-22222',
    title: 'OpenSSL Out-of-Bounds Read in TLS Handshake',
    description: 'An out-of-bounds read vulnerability in OpenSSL TLS Handshake handling can lead to denial of service or information disclosure.',
    vendor: 'OpenSSL Project',
    product: 'OpenSSL',
    cvssScore: 5.3,
    severity: 'medium',
    isExploited: false,
    publishedDate: '2026-05-10T12:00:00Z',
    updatedDate: '2026-05-12T09:00:00Z',
    cvssMetrics: {
      score: 5.3,
      vectorString: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:H',
      accessVector: 'Network',
      accessComplexity: 'High',
      authentication: 'None',
      confidentialityImpact: 'Low',
      integrityImpact: 'None',
      availabilityImpact: 'High'
    },
    mitigation: {
      patchUrl: 'https://www.openssl.org/news/secadv',
      workaround: 'Apply security patches or compile with OpenSSL options disabling legacy TLS suites.'
    },
    references: [
      { source: 'OpenSSL Security', url: 'https://www.openssl.org' }
    ]
  }
];

export const cveService = {
  async getCves(
    filters: CVEFilters,
    page = 1,
    pageSize = 10
  ): Promise<{ items: CVEItem[]; total: number; page: number; pageSize: number }> {
    await new Promise((r) => setTimeout(r, 600));

    let results = [...MOCK_CVES];

    // Filter Query
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (c) =>
          c.cveId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.vendor.toLowerCase().includes(q) ||
          c.product.toLowerCase().includes(q)
      );
    }

    // Filter Severity
    if (filters.severity !== 'all') {
      results = results.filter((c) => c.severity === filters.severity);
    }

    // Filter Exploited Status
    if (filters.isExploited !== 'all') {
      results = results.filter((c) => c.isExploited === filters.isExploited);
    }

    // Filter Vendor
    if (filters.vendor.trim()) {
      const v = filters.vendor.toLowerCase();
      results = results.filter((c) => c.vendor.toLowerCase().includes(v));
    }

    // Filter Product
    if (filters.product.trim()) {
      const p = filters.product.toLowerCase();
      results = results.filter((c) => c.product.toLowerCase().includes(p));
    }

    // Sorting
    results.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case 'cveId':
          cmp = a.cveId.localeCompare(b.cveId);
          break;
        case 'cvssScore':
          cmp = a.cvssScore - b.cvssScore;
          break;
        case 'publishedDate':
          cmp = new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
          break;
        case 'updatedDate':
          cmp = new Date(a.updatedDate).getTime() - new Date(b.updatedDate).getTime();
          break;
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    const total = results.length;
    const start = (page - 1) * pageSize;
    return { items: results.slice(start, start + pageSize), total, page, pageSize };
  },

  async getCveById(cveId: string): Promise<CVEItem | null> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_CVES.find((c) => c.cveId === cveId) ?? null;
  }
};
