import React from 'react';
import { Network, ArrowUpRight } from 'lucide-react';
import type { IOCRelationship } from '../../types/ioc.types';

interface IOCRelationshipPanelProps {
  relationships?: IOCRelationship[];
}

export const IOCRelationshipPanel: React.FC<IOCRelationshipPanelProps> = ({ relationships }) => {
  if (!relationships || relationships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-light-text-muted dark:text-dark-text-muted">
        <Network className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs font-semibold">No semantic threat node relationships mapped.</p>
      </div>
    );
  }

  const TYPE_COLORS: Record<string, string> = {
    threat:   'text-severity-critical bg-severity-critical/10 border-severity-critical/20',
    cve:      'text-severity-medium bg-severity-medium/10 border-severity-medium/20',
    malware:  'text-severity-high bg-severity-high/10 border-severity-high/20',
    actor:    'text-primary-blue dark:text-primary-sky bg-primary-blue/10 dark:bg-primary-sky/10 border-primary-blue/20 dark:border-primary-sky/20',
    campaign: 'text-severity-info bg-severity-info/10 border-severity-info/20'
  };

  return (
    <div className="space-y-3" aria-label="IOC Relationships Matrix">
      {relationships.map((rel, idx) => (
        <div
          key={idx}
          className="p-3 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between gap-3 hover:border-primary-blue/30 dark:hover:border-primary-sky/30 transition-all"
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-badge border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${TYPE_COLORS[rel.targetType] || 'bg-gray-100 text-gray-500'}`}>
                {rel.targetType}
              </span>
              <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary truncate">
                {rel.targetLabel}
              </span>
            </div>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">
              Relation: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{rel.relationType}</strong> (Conf: {rel.confidence}%)
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-light-text-muted shrink-0" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
};

export default IOCRelationshipPanel;
