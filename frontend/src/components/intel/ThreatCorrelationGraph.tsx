import React from 'react';
import { GitBranch } from 'lucide-react';
import type { CorrelationNode, CorrelationLink } from '../../types/intel.types';

interface ThreatCorrelationGraphProps {
  nodes: CorrelationNode[];
  links: CorrelationLink[];
}

const NODE_STYLE: Record<CorrelationNode['type'], string> = {
  cve:      'bg-severity-critical/10 text-severity-critical border-severity-critical/30',
  malware:  'bg-severity-high/10 text-severity-high border-severity-high/30',
  ioc:      'bg-primary-blue/10 text-primary-blue dark:text-primary-sky border-primary-blue/30 dark:border-primary-sky/30',
  actor:    'bg-severity-medium/10 text-severity-medium border-severity-medium/30',
  campaign: 'bg-severity-info/10 text-severity-info border-severity-info/30',
};

const NODE_LABELS: Record<CorrelationNode['type'], string> = {
  cve: 'CVE', malware: 'Malware', ioc: 'IOC', actor: 'Actor', campaign: 'Campaign',
};

export const ThreatCorrelationGraph: React.FC<ThreatCorrelationGraphProps> = ({ nodes, links }) => (
  <div
    className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small overflow-hidden"
    role="region"
    aria-label="Threat correlation relationship graph"
  >
    {/* Graph header */}
    <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/30">
      <GitBranch className="h-4 w-4 text-primary-blue dark:text-primary-sky" aria-hidden="true" />
      <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
        Threat Entity Correlation Graph
      </h2>
      <span className="ml-auto text-[10px] text-light-text-muted">
        {nodes.length} nodes · {links.length} edges — React Flow integration planned Phase 8
      </span>
    </div>

    <div className="p-5 space-y-6">
      {/* Nodes grid */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted mb-3">
          Entities
        </h3>
        <div className="flex flex-wrap gap-2">
          {nodes.map((node) => (
            <span
              key={node.id}
              className={`inline-flex flex-col items-start gap-0.5 rounded-card border px-3 py-2 text-xs ${NODE_STYLE[node.type]}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                {NODE_LABELS[node.type]}
              </span>
              <span className="font-bold leading-tight">{node.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Edges list */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted mb-3">
          Relationships
        </h3>
        <ul className="space-y-2" role="list">
          {links.map((link, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 text-xs text-light-text-secondary dark:text-dark-text-secondary py-1.5 px-3 rounded-input border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-bg-secondary/20"
            >
              <span className="font-mono font-bold text-light-text-primary dark:text-dark-text-primary truncate max-w-[120px]">
                {link.source}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-light-text-muted border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded shrink-0">
                {link.label}
              </span>
              <span className="font-mono font-bold text-light-text-primary dark:text-dark-text-primary truncate max-w-[120px]">
                {link.target}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Placeholder banner */}
      <div className="rounded-card bg-primary-blue/5 dark:bg-primary-sky/5 border border-primary-blue/15 dark:border-primary-sky/15 px-4 py-3 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-primary-blue dark:text-primary-sky shrink-0" aria-hidden="true" />
        <p className="text-[11px] text-primary-blue dark:text-primary-sky leading-relaxed">
          <strong>Phase 8 Enhancement:</strong> Full interactive node-graph visualization using{' '}
          <strong>React Flow (xyflow)</strong> will replace this tabular view — drag, zoom, and
          edge routing will be implemented.
        </p>
      </div>
    </div>
  </div>
);

export default ThreatCorrelationGraph;
