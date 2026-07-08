import React from 'react';
import { ShieldAlert, Hash, Bug, Users } from 'lucide-react';

/* Investigation panel — placeholder cards for related intel categories.
   Backend integration deferred to Phase 6. */

interface InvestigationItem {
  id: string;
  label: string;
  value: string;
  sub?: string;
}

interface InvestigationSectionProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  items: InvestigationItem[];
  accent: string;
}

const InvestigationSection: React.FC<InvestigationSectionProps> = ({
  icon: Icon,
  title,
  items,
  accent,
}) => (
  <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card overflow-hidden">
    <div className={`flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${accent}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4>
      <span className="ml-auto text-[10px] font-semibold opacity-70">{items.length} entries</span>
    </div>
    <ul className="divide-y divide-gray-100 dark:divide-gray-800" role="list">
      {items.map((item) => (
        <li key={item.id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" role="listitem">
          <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary font-mono">
            {item.value}
          </p>
          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">
            {item.label}
            {item.sub && <span className="ml-2 opacity-70">{item.sub}</span>}
          </p>
        </li>
      ))}
    </ul>
    <div className="px-4 py-2 bg-gray-50 dark:bg-dark-bg-secondary/30 border-t border-gray-100 dark:border-gray-800">
      <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted italic">
        Full correlation requires backend integration — Phase 6
      </p>
    </div>
  </div>
);

interface ThreatInvestigationPanelProps {
  threatId?: string;
}

export const ThreatInvestigationPanel: React.FC<ThreatInvestigationPanelProps> = () => {
  // Mock intelligence data — replace with API calls in Phase 6
  const relatedCVEs: InvestigationItem[] = [
    { id: 'c1', label: 'CVSS 9.8 — RCE', value: 'CVE-2026-34567', sub: 'AcmeWeb CMS' },
    { id: 'c2', label: 'CVSS 7.5 — XSS', value: 'CVE-2025-89123', sub: 'AcmeWeb CMS' },
  ];

  const relatedIOCs: InvestigationItem[] = [
    { id: 'i1', label: 'IP Address', value: '185.220.101.47', sub: 'C2 Server' },
    { id: 'i2', label: 'Domain', value: 'acmeweb-exploit.baddomain.io', sub: 'Malicious Domain' },
    { id: 'i3', label: 'SHA-256 Hash', value: 'a3f2c1d4e5b6…', sub: 'Payload Binary' },
  ];

  const malwareFamilies: InvestigationItem[] = [
    { id: 'm1', label: 'Ransomware Loader', value: 'LockBit.v9', sub: 'Scheduler-based' },
    { id: 'm2', label: 'Info-Stealer', value: 'RedLine.Stealer', sub: 'Exfil module' },
  ];

  const threatActors: InvestigationItem[] = [
    { id: 'a1', label: 'Russian Nexus APT', value: 'APT29 / Cozy Bear', sub: 'State-sponsored' },
    { id: 'a2', label: 'Financial Motivation', value: 'Cl0p Group', sub: 'eCrime' },
  ];

  return (
    <div className="space-y-4" aria-label="Threat investigation panel">
      <InvestigationSection
        icon={ShieldAlert}
        title="Related CVEs"
        items={relatedCVEs}
        accent="text-severity-critical bg-severity-critical/5"
      />
      <InvestigationSection
        icon={Hash}
        title="Related IOCs"
        items={relatedIOCs}
        accent="text-primary-blue dark:text-primary-sky bg-primary-blue/5 dark:bg-primary-sky/5"
      />
      <InvestigationSection
        icon={Bug}
        title="Malware Families"
        items={malwareFamilies}
        accent="text-severity-high bg-severity-high/5"
      />
      <InvestigationSection
        icon={Users}
        title="Threat Actors"
        items={threatActors}
        accent="text-severity-medium bg-severity-medium/5"
      />
    </div>
  );
};

export default ThreatInvestigationPanel;
