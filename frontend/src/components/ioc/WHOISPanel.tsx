import React from 'react';
import { Globe } from 'lucide-react';
import type { WHOISInfo } from '../../types/ioc.types';

interface WHOISPanelProps {
  whois?: WHOISInfo;
}

export const WHOISPanel: React.FC<WHOISPanelProps> = ({ whois }) => {
  if (!whois) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-light-text-muted dark:text-dark-text-muted">
        <Globe className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs font-semibold">No WHOIS registrar logs available for this indicator type.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-4 space-y-4" aria-label="WHOIS registration details">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <Globe className="h-4 w-4 text-primary-blue dark:text-primary-sky" aria-hidden="true" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">Registrar Information</h3>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <dt className="text-[10px] text-light-text-muted uppercase font-bold">Registrant Domain / Host</dt>
          <dd className="font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">{whois.domain}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-light-text-muted uppercase font-bold">Registrar Authority</dt>
          <dd className="font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">{whois.registrar}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-light-text-muted uppercase font-bold">Creation Date</dt>
          <dd className="font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">{new Date(whois.creationDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-light-text-muted uppercase font-bold">Expiration Date</dt>
          <dd className="font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">{new Date(whois.expirationDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-light-text-muted uppercase font-bold">Country Origin</dt>
          <dd className="font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">{whois.country}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-light-text-muted uppercase font-bold">Organization</dt>
          <dd className="font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">{whois.organization}</dd>
        </div>
      </dl>
    </div>
  );
};

export default WHOISPanel;
