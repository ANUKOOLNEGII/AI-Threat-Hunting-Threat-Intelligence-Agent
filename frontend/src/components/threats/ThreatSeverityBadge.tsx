import React from 'react';
import type { ThreatSeverity } from '../../types/threat.types';

interface ThreatSeverityBadgeProps {
  severity: ThreatSeverity;
  size?: 'sm' | 'md';
}

const CONFIG: Record<ThreatSeverity, { label: string; className: string; dot: string }> = {
  critical:      { label: 'Critical',      className: 'bg-severity-critical/12 text-severity-critical border-severity-critical/25',   dot: 'bg-severity-critical' },
  high:          { label: 'High',          className: 'bg-severity-high/12 text-severity-high border-severity-high/25',               dot: 'bg-severity-high' },
  medium:        { label: 'Medium',        className: 'bg-severity-medium/12 text-severity-medium border-severity-medium/25',         dot: 'bg-severity-medium' },
  low:           { label: 'Low',           className: 'bg-severity-low/12 text-severity-low border-severity-low/25',                  dot: 'bg-severity-low' },
  informational: { label: 'Info',          className: 'bg-severity-info/12 text-severity-info border-severity-info/25',               dot: 'bg-severity-info' },
};

export const ThreatSeverityBadge: React.FC<ThreatSeverityBadgeProps> = ({
  severity,
  size = 'md',
}) => {
  const { label, className, dot } = CONFIG[severity];
  const textSize = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-badge border font-bold uppercase tracking-wider ${textSize} ${className}`}
      aria-label={`Severity: ${label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
};

export default ThreatSeverityBadge;
