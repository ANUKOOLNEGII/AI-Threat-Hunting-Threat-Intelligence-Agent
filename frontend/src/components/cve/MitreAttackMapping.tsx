import React from 'react';
import { Target, ShieldAlert } from 'lucide-react';
import type { MitreAttackMapping } from '../../types/cve.types';

interface MitreAttackMappingProps {
  mapping?: MitreAttackMapping[];
}

export const MitreAttackMappingPanel: React.FC<MitreAttackMappingProps> = ({ mapping }) => {
  if (!mapping || mapping.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-light-text-muted dark:text-dark-text-muted">
        <Target className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs font-semibold">No MITRE ATT&CK adversary technique mappings associated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-label="MITRE ATT&CK Matrix Alignment">
      {mapping.map((map, idx) => (
        <div
          key={idx}
          className="p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex gap-4"
        >
          {/* Visual indicator */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-severity-critical/10 text-severity-critical" aria-hidden="true">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">
                {map.techniqueName}
              </h4>
              <span className="inline-flex items-center rounded-badge bg-severity-critical/10 text-severity-critical border border-severity-critical/20 px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider shrink-0 w-fit">
                {map.techniqueId}
              </span>
            </div>

            <p className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
              Tactic: {map.tactic}
            </p>

            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed pt-1">
              {map.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MitreAttackMappingPanel;
