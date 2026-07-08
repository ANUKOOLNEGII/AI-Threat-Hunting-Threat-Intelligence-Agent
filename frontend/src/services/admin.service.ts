import type { AdminUser, ThreatFeedSource, ScheduledJob, AIConfig, AuditLogEntry, UserStatus } from '../types/admin.types';

/* ---- Mock Database States ---- */
const MOCK_USERS: AdminUser[] = [
  { id: 'usr-1', name: 'Anukool Negi', email: 'anukool.negi@enterprise-defense.com', role: 'admin', organization: 'SOC Command Center', status: 'active', lastLogin: '2026-07-08T18:14:05Z', activityCount: 1420 },
  { id: 'usr-2', name: 'Sarah Jenkins', email: 'sarah.j@enterprise-defense.com', role: 'soc-manager', organization: 'SOC Command Center', status: 'active', lastLogin: '2026-07-08T17:30:00Z', activityCount: 840 },
  { id: 'usr-3', name: 'John Doe', email: 'john.d@enterprise-defense.com', role: 'analyst', organization: 'Incident Response Unit', status: 'active', lastLogin: '2026-07-08T15:20:00Z', activityCount: 652 },
  { id: 'usr-4', name: 'Alice Smith', email: 'alice.s@enterprise-defense.com', role: 'researcher', organization: 'Malware Research Lab', status: 'disabled', lastLogin: '2026-07-01T09:00:00Z', activityCount: 341 },
];

const MOCK_FEEDS: ThreatFeedSource[] = [
  { id: 'feed-1', provider: 'AlienVault OTX', enabled: true, lastSync: '2026-07-08T18:00:00Z', recordsProcessed: 14250, successRate: 99.8 },
  { id: 'feed-2', provider: 'Abuse.ch URLhaus', enabled: true, lastSync: '2026-07-08T18:15:00Z', recordsProcessed: 8900, successRate: 100 },
  { id: 'feed-3', provider: 'CISA KEV Catalog', enabled: true, lastSync: '2026-07-08T12:00:00Z', recordsProcessed: 124, successRate: 98.4 },
  { id: 'feed-4', provider: 'Shodan Exploit DB', enabled: false, lastSync: '2026-07-07T22:00:00Z', recordsProcessed: 0, successRate: 0 },
];

const MOCK_JOBS: ScheduledJob[] = [
  { id: 'job-1', name: 'AlienVault Feed Sync', schedule: '*/15 * * * *', status: 'idle', lastRun: '2026-07-08T18:00:00Z', nextRun: '2026-07-08T18:15:00Z' },
  { id: 'job-2', name: 'Abuse.ch Feed Sync', schedule: '*/10 * * * *', status: 'running', lastRun: '2026-07-08T18:15:00Z', nextRun: '2026-07-08T18:25:00Z' },
  { id: 'job-3', name: 'CISA Catalog Sync', schedule: '0 0 * * *', status: 'idle', lastRun: '2026-07-08T12:00:00Z', nextRun: '2026-07-09T12:00:00Z' },
];

const MOCK_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  model: 'gemini-1.5-pro',
  temperature: 0.2,
  maxTokens: 2048,
  retrievalDepth: 5,
  confidenceThreshold: 75,
};

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'aud-1', user: 'anukool.negi@enterprise-defense.com', action: 'EXPORT_REPORT', module: 'Reports', timestamp: '2026-07-08T18:22:00Z', status: 'success', ipAddress: '10.0.4.12' },
  { id: 'aud-2', user: 'anukool.negi@enterprise-defense.com', action: 'UPDATE_SETTINGS', module: 'Settings', timestamp: '2026-07-08T18:20:00Z', status: 'success', ipAddress: '10.0.4.12' },
  { id: 'aud-3', user: 'sarah.j@enterprise-defense.com', action: 'DISABLE_USER', module: 'Admin', timestamp: '2026-07-08T17:45:00Z', status: 'success', ipAddress: '10.0.4.45' },
  { id: 'aud-4', user: 'john.d@enterprise-defense.com', action: 'RUN_INVESTIGATION', module: 'AI Assistant', timestamp: '2026-07-08T15:32:00Z', status: 'failed', ipAddress: '10.0.4.88' },
];

/* ============================================================
   Phase 10 Mock Services
   ============================================================ */
export const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    await new Promise((r) => setTimeout(r, 400));
    return [...MOCK_USERS];
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<AdminUser> {
    await new Promise((r) => setTimeout(r, 300));
    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    user.status = status;
    return { ...user };
  },

  async getFeeds(): Promise<ThreatFeedSource[]> {
    await new Promise((r) => setTimeout(r, 400));
    return [...MOCK_FEEDS];
  },

  async updateFeedStatus(id: string, enabled: boolean): Promise<ThreatFeedSource> {
    await new Promise((r) => setTimeout(r, 300));
    const feed = MOCK_FEEDS.find((f) => f.id === id);
    if (!feed) throw new Error('Feed not found');
    feed.enabled = enabled;
    return { ...feed };
  },

  async getJobs(): Promise<ScheduledJob[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_JOBS];
  },

  async updateJobStatus(id: string, status: ScheduledJob['status']): Promise<ScheduledJob> {
    await new Promise((r) => setTimeout(r, 200));
    const job = MOCK_JOBS.find((j) => j.id === id);
    if (!job) throw new Error('Job not found');
    job.status = status;
    return { ...job };
  },

  async getAIConfig(): Promise<AIConfig> {
    await new Promise((r) => setTimeout(r, 300));
    return { ...MOCK_AI_CONFIG };
  },

  async updateAIConfig(config: Partial<AIConfig>): Promise<AIConfig> {
    await new Promise((r) => setTimeout(r, 400));
    Object.assign(MOCK_AI_CONFIG, config);
    return { ...MOCK_AI_CONFIG };
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    await new Promise((r) => setTimeout(r, 500));
    return [...MOCK_AUDIT_LOGS];
  }
};
