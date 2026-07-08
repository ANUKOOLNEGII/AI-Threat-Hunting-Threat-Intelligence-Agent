import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, User, FileText, FileSpreadsheet } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import type { ThreatReport } from '../../types/settings.types';
import { ReportPreviewSkeleton } from '../../components/settings/SettingsSkeletons';
import { PageHeader } from '../../components/ui/States';
import { ExportModal } from '../../components/settings/ExportModal';
import { useToast } from '../../contexts/ToastContext';

export const ReportPreviewPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [report, setReport] = useState<ThreatReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    settingsService.getReports().then((list) => {
      const found = list.find((r) => r.id === reportId);
      if (found) {
        setReport(found);
      } else {
        toast.error('Briefing report file not found.');
      }
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load briefing document metadata.');
      setLoading(false);
    });
  }, [reportId, toast]);

  if (loading) {
    return <ReportPreviewSkeleton />;
  }

  if (!report) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-sm text-light-text-muted">Briefing document could not be retrieved from vault storage.</p>
        <button onClick={() => navigate('/reports')} className="mt-4 text-xs font-bold text-primary-blue dark:text-primary-sky underline">
          Back to Reports Dashboard
        </button>
      </div>
    );
  }

  return (
    <main className="space-y-6 px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/reports')}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          aria-label="Back to reports list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xs font-bold text-light-text-muted">Reports / Document Preview</span>
      </div>

      <PageHeader
        title={report.name}
        subtitle={`System Document ID: ${report.id}`}
        action={
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors shadow-small"
          >
            <Download className="h-4 w-4" />
            Export Document
          </button>
        }
      />

      {/* Meta Specs bar */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4.5 w-4.5 text-light-text-muted shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-light-text-muted block">Compiled On</span>
            <time className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary truncate" dateTime={report.generatedAt}>
              {new Date(report.generatedAt).toLocaleString()}
            </time>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <User className="h-4.5 w-4.5 text-light-text-muted shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-light-text-muted block">Compiled By</span>
            <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary truncate">
              {report.generatedBy}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <FileText className="h-4.5 w-4.5 text-light-text-muted shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-light-text-muted block">Document Type</span>
            <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide truncate">
              {report.type.replace('-', ' ')}
            </span>
          </div>
        </div>
      </section>

      {/* Structured document body */}
      <article className="p-6 sm:p-8 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-6 shadow-small">
        <div className="border-b border-gray-150 dark:border-gray-800 pb-5">
          <div className="flex items-center gap-2 text-primary-blue dark:text-primary-sky mb-2">
            <FileSpreadsheet className="h-6 w-6" />
            <span className="text-[10px] font-black uppercase tracking-wider tracking-widest">
              Global Cyber Command Center
            </span>
          </div>
          <h2 className="text-lg font-black text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide">
            {report.name}
          </h2>
          <p className="text-xs text-light-text-muted mt-1 leading-relaxed">
            {report.summary ?? 'No briefing overview summary compiled.'}
          </p>
        </div>

        {/* Dynamic section loops */}
        {report.sections && report.sections.length > 0 ? (
          <div className="space-y-6">
            {report.sections.map((sect, index) => (
              <section key={index} className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-1.5">
                  {sect.title}
                </h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed whitespace-pre-wrap">
                  {sect.content}
                </p>
              </section>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-light-text-muted">
            <p className="text-xs">This report template does not contain dynamic sub-sections.</p>
          </div>
        )}

        {/* Charts and map placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800/60">
          <div className="h-48 rounded bg-gray-50 dark:bg-dark-bg-secondary flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 dark:border-gray-850 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Vulnerability Impact Matrix</span>
            <p className="text-[10px] text-light-text-muted mt-1">Simulated Heatmap visualization compiled</p>
          </div>
          <div className="h-48 rounded bg-gray-50 dark:bg-dark-bg-secondary flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 dark:border-gray-850 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Outbound Traffic Distribution</span>
            <p className="text-[10px] text-light-text-muted mt-1">Simulated Geographical attack lines plotted</p>
          </div>
        </div>
      </article>

      {/* Export modal overlay */}
      {showExport && (
        <ExportModal
          report={report}
          onClose={() => setShowExport(false)}
          onExport={(format) => {
            toast.success(`Briefing report exported successfully as ${format.toUpperCase()}`);
          }}
        />
      )}
    </main>
  );
};
export default ReportPreviewPage;
