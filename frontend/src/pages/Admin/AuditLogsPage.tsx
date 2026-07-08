import React, { useEffect, useState } from 'react';
import { Download, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { AuditLogEntry } from '../../types/admin.types';
import { TableSkeleton } from '../../components/admin/AdminSkeletons';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

export const AuditLogsPage: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getAuditLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load system security audit logs.');
      setLoading(false);
    });
  }, [toast]);

  const handleExport = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit logs exported as JSON file.');
  };

  const filtered = logs.filter((log) => 
    log.user.toLowerCase().includes(search.toLowerCase()) || 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Security Audit Logs"
        subtitle="Immutable records of administrative actions, config overrides, and user exports."
        action={
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors shadow-small disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Audit Logs
          </button>
        }
      />

      {/* Filter panel */}
      <section className="p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by action, user, or module..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none"
            aria-label="Search audit logs"
          />
        </div>
      </section>

      {/* Table */}
      <section>
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card">
            <p className="text-xs text-light-text-muted">No audit logs match current query parameters.</p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-card overflow-hidden bg-white dark:bg-dark-bg-card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800" aria-label="Immutable administrative audit logs">
                <thead className="bg-gray-50 dark:bg-dark-bg-secondary text-[10px] font-black uppercase tracking-wider text-light-text-muted text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">Timestamp</th>
                    <th scope="col" className="px-4 py-3.5">Operator (User)</th>
                    <th scope="col" className="px-4 py-3.5">Action Executed</th>
                    <th scope="col" className="px-4 py-3.5">Target Module</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-4 py-3.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-xs text-light-text-primary dark:text-dark-text-primary">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover">
                      <td className="px-4 py-3.5 text-light-text-muted text-[10px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <time dateTime={log.timestamp}>{new Date(log.timestamp).toLocaleString()}</time>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold truncate max-w-[180px]">
                        {log.user}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-primary-blue dark:text-primary-sky">
                        {log.action}
                      </td>
                      <td className="px-4 py-3.5 text-light-text-secondary dark:text-dark-text-secondary">
                        {log.module}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          log.status === 'success'
                            ? 'bg-positive-bg text-positive border-positive/30'
                            : 'bg-severity-critical/10 text-severity-critical border-severity-critical/30'
                        }`}>
                          {log.status === 'success' ? (
                            <CheckCircle className="h-3 w-3 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 shrink-0" />
                          )}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-light-text-muted">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
export default AuditLogsPage;
