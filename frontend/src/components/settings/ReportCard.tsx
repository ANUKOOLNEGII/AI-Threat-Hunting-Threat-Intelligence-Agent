import React from 'react';
import { Eye, Download, Trash2, Share2, FileText } from 'lucide-react';
import type { ThreatReport } from '../../types/settings.types';

interface ReportCardProps {
  report: ThreatReport;
  onOpen: (id: string) => void;
  onDownload: (report: ThreatReport) => void;
  onDelete: (id: string) => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return 'Pending';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report, onOpen, onDownload, onDelete
}) => {
  const isReady = report.status === 'ready';

  return (
    <div className="flex flex-col justify-between p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card hover:shadow-small transition-all">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">
              {report.type.replace('-', ' ')}
            </span>
          </div>
          <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider rounded-badge px-2 py-0.5 border ${
            report.status === 'ready'
              ? 'bg-positive-bg text-positive border-positive/30'
              : report.status === 'failed'
                ? 'bg-severity-critical/10 text-severity-critical border-severity-critical/30'
                : 'bg-severity-medium/10 text-severity-medium border-severity-medium/30 animate-pulse'
          }`}>
            {report.status}
          </span>
        </div>

        <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary line-clamp-2">
          {report.name}
        </h3>
        
        <p className="text-[11px] text-light-text-muted line-clamp-3">
          {report.summary ?? 'Report generation is in progress. Detailed metric logs compiling...'}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] text-light-text-muted truncate">
            By {report.generatedBy}
          </p>
          <p className="text-[9px] font-mono text-light-text-muted">
            {isReady ? formatBytes(report.sizeBytes) : 'Building...'}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0" role="toolbar" aria-label="Report operations">
          <button
            onClick={() => onOpen(report.id)}
            disabled={!isReady}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors disabled:opacity-40"
            aria-label={`Preview report: ${report.name}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDownload(report)}
            disabled={!isReady}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors disabled:opacity-40"
            aria-label={`Download report: ${report.name}`}
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            disabled
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-light-text-muted opacity-40 cursor-not-allowed"
            title="Share — Phase 10"
            aria-label="Share report (coming in Phase 10)"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(report.id)}
            className="p-1.5 rounded hover:bg-severity-critical/10 text-light-text-muted hover:text-severity-critical transition-colors"
            aria-label={`Delete report: ${report.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReportCard;
