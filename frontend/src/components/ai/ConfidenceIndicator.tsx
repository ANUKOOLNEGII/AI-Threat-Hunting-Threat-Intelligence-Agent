import React from 'react';
import type { ConfidenceLevel } from '../../types/ai.types';

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  score?: number;
  showLabel?: boolean;
  className?: string;
}

const CONFIG: Record<ConfidenceLevel, { label: string; color: string; bg: string; border: string }> = {
  'very-high': { label: 'Very High',  color: 'text-positive',          bg: 'bg-positive-bg',        border: 'border-positive/30' },
  'high':      { label: 'High',       color: 'text-severity-low',      bg: 'bg-severity-low/10',    border: 'border-severity-low/30' },
  'medium':    { label: 'Medium',     color: 'text-severity-medium',   bg: 'bg-severity-medium/10', border: 'border-severity-medium/30' },
  'low':       { label: 'Low',        color: 'text-severity-critical',  bg: 'bg-severity-critical/10', border: 'border-severity-critical/30' },
};

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  level, score, showLabel = true, className = '',
}) => {
  const cfg = CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.color} ${className}`}
      title={`Confidence: ${cfg.label}${score != null ? ` (${score}%)` : ''}`}
      aria-label={`Confidence level: ${cfg.label}${score != null ? `, ${score}%` : ''}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')}`} aria-hidden="true" />
      {showLabel && <span>{cfg.label}</span>}
      {score != null && <span className="opacity-80 font-bold normal-case">{score}%</span>}
    </span>
  );
};

export default ConfidenceIndicator;
