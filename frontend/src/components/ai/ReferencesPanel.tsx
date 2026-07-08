import React, { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, ExternalLink, Copy, Check,
} from 'lucide-react';
import type { AIReference, ReferenceSource } from '../../types/ai.types';

interface ReferencesPanelProps {
  references: AIReference[];
  defaultExpanded?: boolean;
}

const SOURCE_COLORS: Record<ReferenceSource, string> = {
  NVD:             'bg-severity-critical/10 text-severity-critical border-severity-critical/30',
  MITRE:           'bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky border-primary-blue/30 dark:border-primary-sky/30',
  CISA:            'bg-severity-high/10 text-severity-high border-severity-high/30',
  VirusTotal:      'bg-severity-medium/10 text-severity-medium border-severity-medium/30',
  Shodan:          'bg-severity-info/10 text-severity-info border-severity-info/30',
  MISP:            'bg-positive-bg text-positive border-positive/30',
  'Vendor Advisory': 'bg-gray-100 dark:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary border-gray-300 dark:border-gray-600',
  NIST:            'bg-primary-blue/10 text-primary-blue border-primary-blue/20',
  GitHub:          'bg-gray-100 dark:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary border-gray-300 dark:border-gray-600',
};

const RELEVANCE_COLORS = {
  high:   'text-severity-critical',
  medium: 'text-severity-medium',
  low:    'text-light-text-muted',
};

const ReferenceItem: React.FC<{ ref: AIReference }> = ({ ref: r }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(r.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-input border border-gray-100 dark:border-gray-800 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors group">
      {/* Source badge */}
      <span className={`shrink-0 inline-flex text-[9px] font-black uppercase tracking-wider border rounded px-1.5 py-0.5 mt-0.5 ${SOURCE_COLORS[r.source]}`}>
        {r.source}
      </span>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary truncate">{r.title}</p>
        <p className="text-[10px] font-mono text-light-text-muted truncate mt-0.5">{r.url}</p>
        {r.publishedDate && (
          <p className="text-[10px] text-light-text-muted mt-0.5">
            {new Date(r.publishedDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Relevance dot */}
      <span
        className={`text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${RELEVANCE_COLORS[r.relevance]}`}
        title={`Relevance: ${r.relevance}`}
      >
        {r.relevance}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Copy URL"
        >
          {copied
            ? <Check className="h-3 w-3 text-positive" />
            : <Copy className="h-3 w-3 text-light-text-muted" />
          }
        </button>
        <a
          href={r.url}
          target="_blank"
          rel="noreferrer noopener"
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Open ${r.source} in new tab`}
        >
          <ExternalLink className="h-3 w-3 text-light-text-muted" />
        </a>
      </div>
    </div>
  );
};

export const ReferencesPanel: React.FC<ReferencesPanelProps> = ({
  references, defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (references.length === 0) return null;

  return (
    <div className="rounded-card border border-gray-200 dark:border-gray-800 overflow-hidden" aria-label="Intelligence References">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-light-bg-secondary/60 dark:bg-dark-bg-secondary/40 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors border-b border-gray-100 dark:border-gray-800"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="references-list"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-primary-blue dark:text-primary-sky" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
            Intelligence Sources
          </span>
          <span className="text-[10px] font-bold text-light-text-muted border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
            {references.length}
          </span>
        </div>
        {expanded
          ? <ChevronUp className="h-3.5 w-3.5 text-light-text-muted" aria-hidden="true" />
          : <ChevronDown className="h-3.5 w-3.5 text-light-text-muted" aria-hidden="true" />
        }
      </button>

      {/* List */}
      {expanded && (
        <div id="references-list" className="p-3 space-y-2 bg-white dark:bg-dark-bg-card">
          {references.map((r) => <ReferenceItem key={r.id} ref={r} />)}
        </div>
      )}
    </div>
  );
};

export default ReferencesPanel;
