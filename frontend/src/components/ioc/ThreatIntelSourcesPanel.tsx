import React from 'react';
import { Database, Clock } from 'lucide-react';
import type { ExternalThreatIntel } from '../../types/ioc.types';

interface ThreatIntelSourcesPanelProps {
  intel?: ExternalThreatIntel[];
}

export const ThreatIntelSourcesPanel: React.FC<ThreatIntelSourcesPanelProps> = ({ intel }) => {
  if (!intel || intel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-light-text-muted dark:text-dark-text-muted">
        <Database className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs font-semibold">No external integration signals mapped.</p>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    malicious: 'text-severity-critical border-severity-critical/20 bg-severity-critical/5',
    suspicious: 'text-severity-medium border-severity-medium/20 bg-severity-medium/5',
    clean:      'text-severity-low border-severity-low/20 bg-severity-low/5',
    unknown:    'text-light-text-muted border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-dark-bg-card'
  };

  return (
    <div className="space-y-3" aria-label="External Threat Intelligence Integrations">
      {intel.map((feed, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-card border ${STATUS_COLORS[feed.status] || STATUS_COLORS.unknown} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
        >
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">{feed.sourceName} Integration</h4>
            {feed.score && (
              <p className="text-[11px] font-bold font-mono">Signal: {feed.score}</p>
            )}
            {feed.details && (
              <p className="text-[10px] opacity-80 leading-relaxed">{feed.details}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] opacity-75 sm:text-right shrink-0">
            <Clock className="h-3 w-3" />
            <span>Checked: {new Date(feed.lastChecked).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreatIntelSourcesPanel;
