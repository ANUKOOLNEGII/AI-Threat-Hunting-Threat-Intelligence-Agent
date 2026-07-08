import React from 'react';
import { Globe, Tag, Hash, Building2, Package } from 'lucide-react';
import type { ThreatItem } from '../../types/threat.types';
import { ThreatSeverityBadge } from './ThreatSeverityBadge';
import { ThreatStatusBadge } from './ThreatStatusBadge';

interface ThreatMetadataProps {
  threat: ThreatItem;
  loading?: boolean;
}

interface MetaRowProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}

const MetaRow: React.FC<MetaRowProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
    <Icon className="h-4 w-4 text-light-text-muted mt-0.5 shrink-0" aria-hidden="true" />
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
        {label}
      </span>
      <div className="text-xs text-light-text-primary dark:text-dark-text-primary font-medium break-words">
        {value}
      </div>
    </div>
  </div>
);

const CATEGORY_LABELS: Record<string, string> = {
  vulnerability: 'Vulnerability',
  campaign: 'Campaign',
  malware: 'Malware',
  ransomware: 'Ransomware',
  phishing: 'Phishing',
  'data-breach': 'Data Breach',
  apt: 'APT / Threat Actor',
  'zero-day': 'Zero-Day',
  advisory: 'Advisory',
};

export const ThreatMetadata: React.FC<ThreatMetadataProps> = ({ threat, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading metadata">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className="space-y-0" aria-label="Threat metadata">
      <MetaRow icon={Globe} label="Source" value={threat.source.name} />
      <MetaRow
        icon={Tag}
        label="Category"
        value={CATEGORY_LABELS[threat.category] ?? threat.category}
      />
      <MetaRow
        icon={Hash}
        label="Severity"
        value={<ThreatSeverityBadge severity={threat.severity} size="sm" />}
      />
      <MetaRow
        icon={Hash}
        label="Status"
        value={<ThreatStatusBadge status={threat.status} />}
      />
      {threat.affectedVendor && (
        <MetaRow icon={Building2} label="Affected Vendor" value={threat.affectedVendor} />
      )}
      {threat.affectedProduct && (
        <MetaRow icon={Package} label="Affected Product" value={threat.affectedProduct} />
      )}
      {threat.cvssScore !== undefined && (
        <MetaRow
          icon={Hash}
          label="CVSS Score"
          value={
            <span
              className={`font-bold ${
                threat.cvssScore >= 9
                  ? 'text-severity-critical'
                  : threat.cvssScore >= 7
                  ? 'text-severity-high'
                  : threat.cvssScore >= 4
                  ? 'text-severity-medium'
                  : 'text-severity-low'
              }`}
            >
              {threat.cvssScore.toFixed(1)}
            </span>
          }
        />
      )}
      {threat.referenceIds && threat.referenceIds.length > 0 && (
        <MetaRow
          icon={Hash}
          label="Reference IDs"
          value={
            <div className="flex flex-wrap gap-1">
              {threat.referenceIds.map((ref) => (
                <span
                  key={ref}
                  className="inline-flex items-center rounded-badge bg-primary-blue/8 dark:bg-primary-sky/8 border border-primary-blue/15 dark:border-primary-sky/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-blue dark:text-primary-sky"
                >
                  {ref}
                </span>
              ))}
            </div>
          }
        />
      )}
      {threat.tags && threat.tags.length > 0 && (
        <MetaRow
          icon={Tag}
          label="Tags"
          value={
            <div className="flex flex-wrap gap-1">
              {threat.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-badge bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 text-[10px] text-light-text-muted dark:text-dark-text-muted font-medium"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          }
        />
      )}
    </dl>
  );
};

export default ThreatMetadata;
