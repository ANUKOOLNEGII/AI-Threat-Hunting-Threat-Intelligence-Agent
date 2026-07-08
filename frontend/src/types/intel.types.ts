export type MalwareSeverity = 'critical' | 'high' | 'medium' | 'low';
export type MalwareStatus = 'active' | 'analyzed' | 'signature-generated' | 'quarantined';

export interface MalwareItem {
  id: string;
  family: string;
  severity: MalwareSeverity;
  platform: string;
  sha256: string;
  threatActor?: string;
  firstSeen: string;
  lastSeen: string;
  confidence: number;
  status: MalwareStatus;
  description?: string;
  fileActivity?: string[];
  registryKeys?: string[];
  persistenceMechanisms?: string[];
  networkConnection?: string;
}

export interface RansomwareCampaign {
  id: string;
  name: string;
  threatActor: string;
  victimCount: number;
  industries: string[];
  countries: string[];
  firstSeen: string;
  lastSeen: string;
  initialAccess: string;
  mitigation: string;
  associatedMalware: string[];
  associatedCves: string[];
}

export interface PhishingDomain {
  id: string;
  domain: string;
  registrar: string;
  creationDate: string;
  reputation: 'malicious' | 'suspicious' | 'unknown';
  relatedThreats?: string[];
  relatedCampaigns?: string[];
}

export interface PhishingEmail {
  id: string;
  sender: string;
  subject: string;
  campaign: string;
  urls: string[];
  attachments: string[];
  indicators: string[];
  receivedDate: string;
}

export interface CorrelationNode {
  id: string;
  label: string;
  type: 'cve' | 'malware' | 'ioc' | 'actor' | 'campaign';
  severity?: string;
}

export interface CorrelationLink {
  source: string;
  target: string;
  label: string;
}
