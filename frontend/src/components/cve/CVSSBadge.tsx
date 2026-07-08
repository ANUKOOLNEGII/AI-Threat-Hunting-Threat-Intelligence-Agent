import React from 'react';
import type { CVESeverity } from '../../types/cve.types';

interface CVSSBadgeProps {
  score: number;
  severity: CVESeverity;
}

const CONFIG: Record<CVESeverity, { label: string; className: string; dot: string }> = {
  critical:      { label: 'Critical',      className: 'bg-severity-critical/12 text-severity-critical border-severity-critical/25',   dot: 'bg-severity-critical' },
  high:          { label: 'High',          className: 'bg-severity-high/12 text-severity-high border-severity-high/25',               dot: 'bg-severity-high' },
  medium:        { label: 'Medium',        className: 'bg-severity-medium/12 text-severity-medium border-severity-medium/25',         dot: 'bg-severity-medium' },
  low:           { label: 'Low',           className: 'bg-severity-low/12 text-severity-low border-severity-low/25',                  dot: 'bg-severity-low' },
  informational: { label: 'Info',          className: 'bg-severity-info/12 text-severity-info border-severity-info/25',               dot: 'bg-severity-info' },
};

export const CVSSBadge: React.FC<CVSSBadgeProps> = ({ score, severity }) => {
  const config = CONFIG[severity] || CONFIG.informational;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.className}`}
      title={`CVSS Score: ${score.toFixed(1)} (${config.label})`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {score.toFixed(1)}
    </span>
  );
};

export default CVSSBadge;
