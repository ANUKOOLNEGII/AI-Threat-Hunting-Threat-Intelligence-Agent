import React from 'react';
import { Target, Wifi, Bug, Lock, Globe, Info } from 'lucide-react';
import type { InvestigationContext } from '../../types/ai.types';

interface InvestigationContextPanelProps {
  context?: InvestigationContext;
  onClear?: () => void;
}

const CONTEXT_ICONS: Record<InvestigationContext['type'], React.FC<{ className?: string }>> = {
  cve:      Target,
  ioc:      Wifi,
  malware:  Bug,
  campaign: Lock,
  actor:    Globe,
  general:  Info,
};

const CONTEXT_COLORS: Record<InvestigationContext['type'], string> = {
  cve:      'border-severity-critical/20 bg-severity-critical/5 text-severity-critical',
  ioc:      'border-primary-blue/20 bg-primary-blue/5 text-primary-blue dark:border-primary-sky/20 dark:bg-primary-sky/5 dark:text-primary-sky',
  malware:  'border-severity-high/20 bg-severity-high/5 text-severity-high',
  campaign: 'border-severity-medium/20 bg-severity-medium/5 text-severity-medium',
  actor:    'border-severity-info/20 bg-severity-info/5 text-severity-info',
  general:  'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg-secondary text-light-text-secondary dark:text-dark-text-secondary',
};

const SEVERITY_CLASSES: Record<string, string> = {
  critical: 'text-severity-critical',
  high:     'text-severity-high',
  medium:   'text-severity-medium',
  low:      'text-severity-info',
};

export const InvestigationContextPanel: React.FC<InvestigationContextPanelProps> = ({
  context, onClear,
}) => {
  if (!context) return null;

  const Icon  = CONTEXT_ICONS[context.type];
  const color = CONTEXT_COLORS[context.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-card border text-sm ${color}`}
      role="status"
      aria-label="Active investigation context"
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
          Active Context · {context.type.toUpperCase()}
        </span>
        <span className="font-bold truncate block text-xs">{context.label}</span>
      </div>
      {context.severity && (
        <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 ${SEVERITY_CLASSES[context.severity] ?? ''}`}>
          {context.severity}
        </span>
      )}
      {onClear && (
        <button
          onClick={onClear}
          className="text-[10px] font-bold opacity-70 hover:opacity-100 transition-opacity underline shrink-0"
          aria-label="Clear investigation context"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default InvestigationContextPanel;
