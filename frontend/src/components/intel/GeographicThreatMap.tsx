import React from 'react';
import { Globe, RefreshCw } from 'lucide-react';

interface GeographicThreatMapProps {
  origins: string[];
  victims: string[];
}

export const GeographicThreatMap: React.FC<GeographicThreatMapProps> = ({ origins, victims }) => {
  return (
    <div
      className="border border-gray-200 dark:border-gray-800 rounded-card p-5 bg-white dark:bg-dark-bg-card shadow-small flex flex-col md:flex-row gap-6 items-center justify-between"
      role="region"
      aria-label="Geographic Threat Activity Map"
    >
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
          <Globe className="h-4 w-4 text-primary-blue dark:text-primary-sky" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
            Geographic Activity Origin / Victim Map
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="text-[10px] text-light-text-muted uppercase font-bold tracking-wider">Top Origin Regions</h4>
            <ul className="space-y-1 font-semibold text-light-text-primary dark:text-dark-text-primary list-disc pl-4">
              {origins.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] text-light-text-muted uppercase font-bold tracking-wider">Top Victim Regions</h4>
            <ul className="space-y-1 font-semibold text-light-text-primary dark:text-dark-text-primary list-disc pl-4">
              {victims.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[10px] text-light-text-muted italic pt-2">
          Geographic telemetry feeds mapping deferred to Phase 8 integration.
        </p>
      </div>

      <div
        className="h-32 w-32 shrink-0 rounded-full border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg-secondary flex flex-col items-center justify-center text-center text-[10px] text-light-text-muted select-none"
        aria-hidden="true"
      >
        <RefreshCw className="h-5 w-5 mb-1.5 animate-spin text-primary-blue dark:text-primary-sky" />
        <span>Map Visualizer Offline</span>
      </div>
    </div>
  );
};

export default GeographicThreatMap;
