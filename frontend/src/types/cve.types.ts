export type CVESeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export interface CVSSMetrics {
  score: number;
  vectorString: string;
  accessVector?: string;
  accessComplexity?: string;
  authentication?: string;
  confidentialityImpact?: string;
  integrityImpact?: string;
  availabilityImpact?: string;
}

export interface DetectionRule {
  id: string;
  type: 'sigma' | 'yara' | 'snort' | 'suricata';
  title: string;
  content: string;
}

export interface MitigationSteps {
  patchUrl?: string;
  workaround?: string;
  firewallRecommendation?: string;
  edrRecommendation?: string;
  networkSegmentation?: string;
}

export interface MitreAttackMapping {
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  description: string;
}

export interface CVEReference {
  source: string;
  url: string;
  name?: string;
}

export interface CVEItem {
  cveId: string; // e.g. CVE-2026-34567
  title: string;
  description: string;
  vendor: string;
  product: string;
  cvssScore: number;
  severity: CVESeverity;
  isExploited: boolean;
  publishedDate: string;
  updatedDate: string;
  // Detail-specific fields
  cvssMetrics?: CVSSMetrics;
  detectionRules?: DetectionRule[];
  mitigation?: MitigationSteps;
  mitreAttack?: MitreAttackMapping[];
  references?: CVEReference[];
  relatedCves?: string[];
}

export interface CVEFilters {
  query: string;
  severity: CVESeverity | 'all';
  isExploited: boolean | 'all';
  vendor: string;
  product: string;
  sortBy: 'cveId' | 'cvssScore' | 'publishedDate' | 'updatedDate';
  sortDir: 'asc' | 'desc';
}

export const DEFAULT_CVE_FILTERS: CVEFilters = {
  query: '',
  severity: 'all',
  isExploited: 'all',
  vendor: '',
  product: '',
  sortBy: 'publishedDate',
  sortDir: 'desc',
};
