import React, { useState } from 'react';
import { X, Check, FileDown } from 'lucide-react';
import type { ThreatReport } from '../../types/settings.types';

interface ExportModalProps {
  report: ThreatReport;
  onClose: () => void;
  onExport: (format: 'pdf' | 'html' | 'markdown' | 'json') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ report, onClose, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html' | 'markdown' | 'json'>('pdf');
  const [exported, setExported] = useState(false);

  const handleExportSubmit = () => {
    onExport(selectedFormat);
    setExported(true);
    setTimeout(() => {
      setExported(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="export-title">
      <div className="w-full max-w-sm rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-medium overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-gray-800">
          <h3 id="export-title" className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
            Export Briefing Document
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-hover text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            aria-label="Close export modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Target Document</span>
            <p className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary truncate">{report.name}</p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted block">Select Format</span>
            <div className="grid grid-cols-2 gap-2">
              {(['pdf', 'html', 'markdown', 'json'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  type="button"
                  className={`py-2 px-3 text-xs font-bold rounded border uppercase tracking-wider text-center transition-all ${
                    selectedFormat === format
                      ? 'border-primary-blue dark:border-primary-sky bg-primary-blue/5 dark:bg-primary-sky/5 text-primary-blue dark:text-primary-sky'
                      : 'border-gray-200 dark:border-gray-800 text-light-text-muted hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleExportSubmit}
            disabled={exported}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors disabled:bg-positive disabled:text-white"
          >
            {exported ? (
              <>
                <Check className="h-4 w-4" />
                Download Initiated
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Generate and Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExportModal;
