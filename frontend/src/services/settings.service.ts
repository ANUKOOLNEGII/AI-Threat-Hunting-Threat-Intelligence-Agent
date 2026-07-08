import type { ThreatReport, ThreatNotification, UserProfile, UserSettings } from '../types/settings.types';

/* ---- Mock Reports ---- */
const MOCK_REPORTS: ThreatReport[] = [
  {
    id: 'rep-1',
    name: 'Executive Threat Summary - Q3 2026',
    type: 'executive',
    generatedAt: '2026-07-08T14:30:00Z',
    generatedBy: 'Anukool Negi',
    status: 'ready',
    sizeBytes: 1024 * 342,
    summary: 'High-level strategic briefing summarizing emerging advanced persistent threats, active ransomware groups targeting logistics, and critical CVEs affecting public networks.',
    sections: [
      { title: 'Executive Summary', content: 'In Q3 2026, threat activity reached record highs, driven largely by LockBit ransomware-as-a-service operations and newly disclosed zero-days targeting enterprise VPN routers.' },
      { title: 'Key Indicators', content: 'Active threat actors logged: 12. Malware families cataloged: 84. Total security incidents triaged: 1,420.' },
      { title: 'Strategic Recommendations', content: 'Accelerate zero-day patch deployments to a 24-hour cycle. Restrict inbound traffic from unknown exit nodes. Strengthen authentication controls.' }
    ]
  },
  {
    id: 'rep-2',
    name: 'SSO Harvest Phishing Campaign Analysis',
    type: 'threat-intel',
    generatedAt: '2026-07-07T09:15:00Z',
    generatedBy: 'Anukool Negi',
    status: 'ready',
    sizeBytes: 1024 * 188,
    summary: 'Technical teardown of credential harvesting infrastructure targeting single sign-on portals via typosquat domains.',
    sections: [
      { title: 'Background', content: 'The SSO Harvest 2026 phishing campaign targets financial institutions using Cloudflare lookalike authentication gateways.' },
      { title: 'Observed Indicators', content: 'Active C2 node: c1oudflare-auth.net. Targeted usernames logged: 240+.' }
    ]
  },
  {
    id: 'rep-3',
    name: 'Daily SOC Operational Briefing',
    type: 'daily-soc',
    generatedAt: '2026-07-08T18:00:00Z',
    generatedBy: 'System Auto-Gen',
    status: 'ready',
    sizeBytes: 1024 * 94,
    summary: 'Standard daily summary of triaged alerts, high-risk feeds, and active analyst handovers.',
  },
  {
    id: 'rep-4',
    name: 'LockBit v9 Malware Loader Teardown',
    type: 'malware',
    generatedAt: '2026-07-08T11:20:00Z',
    generatedBy: 'AI Analyst',
    status: 'generating',
  }
];

/* ---- Mock Notifications ---- */
const MOCK_NOTIFICATIONS: ThreatNotification[] = [
  {
    id: 'not-1',
    title: 'Critical Outbound Connection Observed',
    description: 'Endpoint DESKTOP-SOC-42 triggered connection to known C2 Tor relay 185.220.101.47.',
    timestamp: '2026-07-08T18:10:00Z',
    priority: 'critical',
    isRead: false,
    isArchived: false,
    category: 'alert'
  },
  {
    id: 'not-2',
    title: 'AcmeWeb CMS Zero-Day Patch Released',
    description: 'Hotfix for CVE-2026-34567 (RCE, CVSS 9.8) now available. Immediate deployment recommended.',
    timestamp: '2026-07-08T16:45:00Z',
    priority: 'high',
    isRead: false,
    isArchived: false,
    category: 'threat-feed'
  },
  {
    id: 'not-3',
    title: 'AI Analysis Complete',
    description: 'Ransomware mitigation advisory generation completed successfully for LockBit v9 query.',
    timestamp: '2026-07-08T14:32:00Z',
    priority: 'info',
    isRead: true,
    isArchived: false,
    category: 'ai-task'
  },
  {
    id: 'not-4',
    title: 'Weekly Cyber Threat Digest Ready',
    description: 'Weekly digest compiling the top 10 trends for July 1st - 7th has been compiled.',
    timestamp: '2026-07-07T08:00:00Z',
    priority: 'medium',
    isRead: true,
    isArchived: true,
    category: 'report'
  }
];

/* ---- Mock Profile ---- */
const MOCK_PROFILE: UserProfile = {
  name: 'Anukool Negi',
  email: 'anukool.negi@enterprise-defense.com',
  organization: 'Global Security Command Center',
  role: 'Principal Threat Investigator (L3 SOC)',
  lastLogin: '2026-07-08T18:14:05Z',
  status: 'active',
  activitySummary: {
    queriesRun: 148,
    reportsGenerated: 34,
    alertsResolved: 189,
    lastActivityAt: '2026-07-08T18:14:05Z'
  }
};

/* ---- Mock Settings ---- */
const MOCK_SETTINGS: UserSettings = {
  general: {
    language: 'en-US',
    timezone: 'UTC'
  },
  appearance: {
    theme: 'dark',
    fontSize: 'md',
    compactMode: false
  },
  notifications: {
    email: true,
    desktop: true,
    inApp: true,
    criticalAlertsOnly: false,
    weeklyDigest: true,
    aiCompletion: true
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeoutMins: 30
  }
};

/* ============================================================
   Phase 9 Mock Services
   ============================================================ */
export const settingsService = {
  async getReports(): Promise<ThreatReport[]> {
    await new Promise((r) => setTimeout(r, 600));
    return [...MOCK_REPORTS];
  },

  async generateReport(name: string, type: ThreatReport['type']): Promise<ThreatReport> {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      id: `rep-${Math.random().toString(36).slice(2, 9)}`,
      name,
      type,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Anukool Negi',
      status: 'ready',
      sizeBytes: 1024 * Math.floor(50 + Math.random() * 300),
      summary: `Automated ${type.replace('-', ' ')} report focused on active indicators, vulnerabilities, and intelligence recommendations.`,
      sections: [
        { title: 'Executive Summary', content: 'This report compiles active logs and threat indicators collected dynamically by the platform agent.' },
        { title: 'Mitigation Steps', content: 'Deploy perimeter DNS filtering, disable deprecated authentication methods, and monitor high-value subnets.' }
      ]
    };
  },

  async getNotifications(): Promise<ThreatNotification[]> {
    await new Promise((r) => setTimeout(r, 400));
    return [...MOCK_NOTIFICATIONS];
  },

  async getProfile(): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 300));
    return { ...MOCK_PROFILE };
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 800));
    Object.assign(MOCK_PROFILE, profile);
    return { ...MOCK_PROFILE };
  },

  async getSettings(): Promise<UserSettings> {
    await new Promise((r) => setTimeout(r, 300));
    return { ...MOCK_SETTINGS };
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    await new Promise((r) => setTimeout(r, 500));
    if (settings.appearance) Object.assign(MOCK_SETTINGS.appearance, settings.appearance);
    if (settings.notifications) Object.assign(MOCK_SETTINGS.notifications, settings.notifications);
    if (settings.security) Object.assign(MOCK_SETTINGS.security, settings.security);
    if (settings.general) Object.assign(MOCK_SETTINGS.general, settings.general);
    return { ...MOCK_SETTINGS };
  }
};
