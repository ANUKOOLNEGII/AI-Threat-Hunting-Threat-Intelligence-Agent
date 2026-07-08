/* ============================================================
   Phase 9 Shared Type Definitions
   ============================================================ */

/* ---- Reports ---- */
export type ReportType = 
  | 'executive' 
  | 'threat-intel' 
  | 'daily-soc' 
  | 'weekly' 
  | 'ioc' 
  | 'malware' 
  | 'cve' 
  | 'campaign';

export type ReportStatus = 'ready' | 'generating' | 'failed';

export interface ThreatReport {
  id: string;
  name: string;
  type: ReportType;
  generatedAt: string;
  generatedBy: string;
  status: ReportStatus;
  sizeBytes?: number;
  summary?: string;
  sections?: {
    title: string;
    content: string;
  }[];
}

/* ---- Notifications ---- */
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ThreatNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  category: 'alert' | 'threat-feed' | 'ai-task' | 'report' | 'system';
}

/* ---- User Profile ---- */
export interface UserProfile {
  avatarUrl?: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  lastLogin: string;
  status: 'active' | 'suspended' | 'pending';
  activitySummary: {
    queriesRun: number;
    reportsGenerated: number;
    alertsResolved: number;
    lastActivityAt: string;
  };
}

/* ---- User Settings ---- */
export interface UserSettings {
  general: {
    language: string;
    timezone: string;
  };
  appearance: {
    theme: 'dark' | 'light' | 'system';
    fontSize: 'sm' | 'md' | 'lg';
    compactMode: boolean;
  };
  notifications: {
    email: boolean;
    desktop: boolean;
    inApp: boolean;
    criticalAlertsOnly: boolean;
    weeklyDigest: boolean;
    aiCompletion: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeoutMins: number;
  };
}
