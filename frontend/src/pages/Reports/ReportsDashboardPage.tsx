import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ShieldAlert, Cpu, BarChart3 } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import type { ThreatReport, ReportType } from '../../types/settings.types';
import { ReportListSkeleton } from '../../components/settings/SettingsSkeletons';
import { ReportCard } from '../../components/settings/ReportCard';
import { ReportGenerator } from '../../components/settings/ReportGenerator';
import { ExportModal } from '../../components/settings/ExportModal';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

export const ReportsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const [showGenerator, setShowGenerator] = useState(false);
  const [exportTarget, setExportTarget] = useState<ThreatReport | null>(null);

  useEffect(() => {
    settingsService.getReports().then((data) => {
      setReports(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load reports catalog.');
      setLoading(false);
    });
  }, [toast]);

  const handleOpenReport = (id: string) => {
    navigate(`/reports/${id}`);
  };

  const handleDownloadTrigger = (report: ThreatReport) => {
    setExportTarget(report);
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success('Report deleted successfully.');
  };

  const handleGenerate = async (name: string, type: ReportType) => {
    toast.info(`Compiling: "${name}"...`);
    try {
      const newRep = await settingsService.generateReport(name, type);
      setReports((prev) => [newRep, ...prev]);
      toast.success('Report compiled successfully.');
    } catch {
      toast.error('Failed to generate report.');
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                          (r.summary && r.summary.toLowerCase().includes(search.toLowerCase()));
    const matchesType = selectedType === 'all' || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  const readyCount = reports.filter((r) => r.status === 'ready').length;
  const compilingCount = reports.filter((r) => r.status === 'generating').length;

  return (
    <main className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Threat Briefing Reports"
        subtitle="Compile, preview, and export daily or executive intelligence briefs."
        action={
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors shadow-small"
          >
            <Plus className="h-4 w-4" />
            Compile Briefing
          </button>
        }
      />

      {/* Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Reports metrics summary">
        <div className="p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Total Compiled</p>
            <p className="text-lg font-black text-light-text-primary dark:text-dark-text-primary">{readyCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center gap-3">
          <div className="p-2 rounded-full bg-severity-medium/10 text-severity-medium">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Active Generation</p>
            <p className="text-lg font-black text-light-text-primary dark:text-dark-text-primary">{compilingCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center gap-3">
          <div className="p-2 rounded-full bg-severity-critical/10 text-severity-critical">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Executive Briefings</p>
            <p className="text-lg font-black text-light-text-primary dark:text-dark-text-primary">
              {reports.filter((r) => r.type === 'executive').length}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports catalog..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {(['all', 'executive', 'threat-intel', 'daily-soc', 'weekly', 'ioc', 'malware'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`py-1.5 px-3 rounded-badge text-[10px] font-black uppercase tracking-wider border transition-all shrink-0 ${
                selectedType === type
                  ? 'bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary border-transparent'
                  : 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-muted border-gray-200 dark:border-gray-800'
              }`}
            >
              {type.replace('-', ' ')}
            </button>
          ))}
        </div>
      </section>

      {/* Core Grid content */}
      <section>
        {loading ? (
          <ReportListSkeleton />
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card">
            <Filter className="h-10 w-10 text-light-text-muted mx-auto mb-2 opacity-50" />
            <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">No Reports Discovered</h3>
            <p className="text-[11px] text-light-text-muted mt-1">Try refining search parameters or compile a new threat briefing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onOpen={handleOpenReport}
                onDownload={handleDownloadTrigger}
                onDelete={handleDeleteReport}
              />
            ))}
          </div>
        )}
      </section>

      {/* Generator Console overlay */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg">
            <ReportGenerator
              onGenerate={handleGenerate}
              onClose={() => setShowGenerator(false)}
            />
          </div>
        </div>
      )}

      {/* Export download overlay */}
      {exportTarget && (
        <ExportModal
          report={exportTarget}
          onClose={() => setExportTarget(null)}
          onExport={(format) => {
            toast.success(`Exporting as ${format.toUpperCase()}...`);
          }}
        />
      )}
    </main>
  );
};
export default ReportsDashboardPage;
