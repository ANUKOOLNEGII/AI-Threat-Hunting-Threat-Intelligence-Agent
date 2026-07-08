import React from 'react';
import type { ThreatStatus } from '../../types/threat.types';

interface ThreatStatusBadgeProps {
  status: ThreatStatus;
}

const CONFIG: Record<ThreatStatus, { label: string; className: string }> = {
  new:           { label: 'New',           className: 'bg-primary-blue/10 text-primary-blue border-primary-blue/20' },
  active:        { label: 'Active',        className: 'bg-severity-critical/10 text-severity-critical border-severity-critical/20' },
  investigating: { label: 'Investigating', className: 'bg-severity-medium/10 text-severity-medium border-severity-medium/20' },
  closed:        { label: 'Closed',        className: 'bg-gray-100 dark:bg-gray-800 text-light-text-muted dark:text-dark-text-muted border-gray-200 dark:border-gray-700' },
  archived:      { label: 'Archived',      className: 'bg-gray-100 dark:bg-gray-800 text-light-text-muted dark:text-dark-text-muted border-gray-200 dark:border-gray-700' },
};

export const ThreatStatusBadge: React.FC<ThreatStatusBadgeProps> = ({ status }) => {
  const { label, className } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-badge border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${className}`}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
};

export default ThreatStatusBadge;
