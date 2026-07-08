import React from 'react';
import type { IOCReputation } from '../../types/ioc.types';

interface ReputationBadgeProps {
  reputation: IOCReputation;
}

const CONFIG: Record<IOCReputation, { label: string; className: string; dot: string }> = {
  malicious:  { label: 'Malicious',  className: 'bg-severity-critical/12 text-severity-critical border-severity-critical/25',   dot: 'bg-severity-critical' },
  suspicious: { label: 'Suspicious', className: 'bg-severity-medium/12 text-severity-medium border-severity-medium/25',       dot: 'bg-severity-medium' },
  trusted:    { label: 'Trusted',    className: 'bg-severity-low/12 text-severity-low border-severity-low/25',                  dot: 'bg-severity-low' },
  unknown:    { label: 'Unknown',    className: 'bg-gray-100 dark:bg-gray-800 text-light-text-muted dark:text-dark-text-muted border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' },
};

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({ reputation }) => {
  const config = CONFIG[reputation] || CONFIG.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.className}`}
      title={`Reputation: ${config.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
};

export default ReputationBadge;
