/* ============================================================
   Threat Intelligence — Shared TypeScript Types
   Used across ThreatFeedPage, ThreatDetailsPage, and services
   ============================================================ */

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type ThreatStatus   = 'active' | 'investigating' | 'closed' | 'new' | 'archived';
export type ThreatCategory =
  | 'vulnerability'
  | 'campaign'
  | 'malware'
  | 'ransomware'
  | 'phishing'
  | 'data-breach'
  | 'apt'
  | 'zero-day'
  | 'advisory';

export interface ThreatSource {
  name: string;
  url?: string;
  type: 'nvd' | 'cisa' | 'vendor' | 'community' | 'internal';
}

export interface ThreatTimelineEvent {
  id: string;
  timestamp: string; // ISO-8601
  title: string;
  description: string;
  type: 'published' | 'collected' | 'analyzed' | 'updated' | 'closed' | 'escalated';
}

export interface ThreatTag {
  id: string;
  label: string;
  color?: 'blue' | 'red' | 'yellow' | 'green' | 'gray' | 'purple';
}

export interface RelatedThreat {
  id: string;
  title: string;
  severity: ThreatSeverity;
  category: ThreatCategory;
  publishedAt: string;
}

export interface ThreatIOCRef {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
}

export interface ThreatItem {
  id: string;
  title: string;
  summary: string;
  category: ThreatCategory;
  severity: ThreatSeverity;
  status: ThreatStatus;
  source: ThreatSource;
  publishedAt: string;
  updatedAt: string;
  tags: ThreatTag[];
  // Detail-level fields (only populated on detail view)
  description?: string;
  affectedVendor?: string;
  affectedProduct?: string;
  cvssScore?: number;
  aiConfidenceScore?: number; // 0–100
  referenceIds?: string[];    // CVE IDs, advisory IDs, etc.
  timeline?: ThreatTimelineEvent[];
  iocRefs?: ThreatIOCRef[];
  relatedThreats?: RelatedThreat[];
  references?: string[];      // external URLs
}

/* Filter / search state */
export interface ThreatFilters {
  query: string;
  severity: ThreatSeverity | 'all';
  category: ThreatCategory | 'all';
  status: ThreatStatus | 'all';
  source: string; // source name or 'all'
  sortBy: 'publishedAt' | 'severity' | 'title' | 'updatedAt';
  sortDir: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: ThreatFilters = {
  query: '',
  severity: 'all',
  category: 'all',
  status: 'all',
  source: 'all',
  sortBy: 'publishedAt',
  sortDir: 'desc',
};
