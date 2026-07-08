/* ============================================================
   Phase 10 Shared Type Definitions
   ============================================================ */

/* ---- Users ---- */
export type UserRole = 'admin' | 'soc-manager' | 'analyst' | 'researcher' | 'executive';
export type UserStatus = 'active' | 'disabled' | 'pending';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  status: UserStatus;
  lastLogin: string;
  activityCount: number;
}

/* ---- Threat Feed Providers ---- */
export interface ThreatFeedSource {
  id: string;
  provider: string;
  enabled: boolean;
  lastSync: string;
  recordsProcessed: number;
  successRate: number;
}

/* ---- Scheduler ---- */
export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  status: 'running' | 'idle' | 'failed';
  lastRun: string;
  nextRun: string;
}

/* ---- AI Config ---- */
export interface AIConfig {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  retrievalDepth: number;
  confidenceThreshold: number;
}

/* ---- Audit Log ---- */
export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  status: 'success' | 'failed';
  ipAddress: string;
}
