import React from 'react';
import { ShieldCheck, AlertCircle, Wrench, ShieldAlert } from 'lucide-react';
import type { MitigationSteps } from '../../types/cve.types';

interface MitigationPanelProps {
  mitigation?: MitigationSteps;
}

export const MitigationPanel: React.FC<MitigationPanelProps> = ({ mitigation }) => {
  if (!mitigation) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-light-text-muted dark:text-dark-text-muted">
        <ShieldCheck className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs font-semibold">No mitigation details or remediation advisories provided.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-label="Mitigation Strategies">
      {/* Patch Information */}
      {mitigation.patchUrl && (
        <div className="flex gap-3 p-4 rounded-card border border-severity-low/20 bg-severity-low/5">
          <Wrench className="h-5 w-5 text-severity-low shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-severity-low uppercase tracking-wider">Vendor Patch Available</h4>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              A official vendor patch has been released. It is highly recommended to apply the security update immediately.
            </p>
            <a
              href={mitigation.patchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-blue dark:text-primary-sky hover:underline font-bold mt-1"
            >
              Get Vendor Security Update
            </a>
          </div>
        </div>
      )}

      {/* Temporary Workaround */}
      {mitigation.workaround && (
        <div className="flex gap-3 p-4 rounded-card border border-severity-medium/20 bg-severity-medium/5">
          <AlertCircle className="h-5 w-5 text-severity-medium shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-severity-medium uppercase tracking-wider">Temporary Workaround</h4>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed font-medium">
              {mitigation.workaround}
            </p>
          </div>
        </div>
      )}

      {/* Firewall Rules / WAF */}
      {mitigation.firewallRecommendation && (
        <div className="flex gap-3 p-4 rounded-card border border-primary-blue/20 bg-primary-blue/5 dark:border-primary-sky/20 dark:bg-primary-sky/5">
          <ShieldAlert className="h-5 w-5 text-primary-blue dark:text-primary-sky shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-primary-blue dark:text-primary-sky uppercase tracking-wider">WAF / Network Shield Recommendations</h4>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {mitigation.firewallRecommendation}
            </p>
          </div>
        </div>
      )}

      {/* Host / EDR Controls */}
      {mitigation.edrRecommendation && (
        <div className="flex gap-3 p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card">
          <ShieldCheck className="h-5 w-5 text-light-text-muted shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">EDR / Host System Protections</h4>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {mitigation.edrRecommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MitigationPanel;
