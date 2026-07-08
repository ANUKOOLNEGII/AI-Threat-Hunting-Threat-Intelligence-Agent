export type IOCType = 'ip' | 'domain' | 'url' | 'sha256' | 'sha1' | 'md5' | 'email' | 'registry' | 'file';
export type IOCReputation = 'malicious' | 'suspicious' | 'unknown' | 'trusted';
export type IOCStatus = 'active' | 'investigating' | 'mitigated' | 'false-positive' | 'whitelist';

export interface WHOISInfo {
  domain: string;
  registrar: string;
  creationDate: string;
  expirationDate: string;
  country: string;
  organization: string;
}

export interface IOCTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'first-seen' | 'updated' | 'matched' | 'correlated' | 'investigated';
}

export interface IOCRelationship {
  targetId: string;
  targetType: 'threat' | 'cve' | 'malware' | 'actor' | 'campaign';
  targetLabel: string;
  relationType: string;
  confidence: number; // 0-100
}

export interface ExternalThreatIntel {
  sourceName: string; // e.g. VirusTotal, Shodan
  score?: string;     // e.g. 45/90 malicious
  status: 'clean' | 'suspicious' | 'malicious' | 'unknown';
  lastChecked: string;
  details?: string;
}

export interface IOCItem {
  id: string;
  value: string;
  type: IOCType;
  reputation: IOCReputation;
  confidence: number; // 0-100
  source: string;
  threatCount: number;
  firstSeen: string;
  lastSeen: string;
  status: IOCStatus;
  // Detail-specific fields
  whois?: WHOISInfo;
  timeline?: IOCTimelineEvent[];
  relationships?: IOCRelationship[];
  externalIntel?: ExternalThreatIntel[];
  description?: string;
}

export interface IOCFilters {
  query: string;
  type: IOCType | 'all';
  reputation: IOCReputation | 'all';
  status: IOCStatus | 'all';
  sortBy: 'value' | 'reputation' | 'confidence' | 'lastSeen';
  sortDir: 'asc' | 'desc';
}

export const DEFAULT_IOC_FILTERS: IOCFilters = {
  query: '',
  type: 'all',
  reputation: 'all',
  status: 'all',
  sortBy: 'lastSeen',
  sortDir: 'desc',
};
