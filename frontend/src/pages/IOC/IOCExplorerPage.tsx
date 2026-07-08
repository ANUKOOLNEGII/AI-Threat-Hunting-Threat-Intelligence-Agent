import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Calendar, ArrowUpRight, Server, ShieldAlert } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setCurrentPage } from '../../redux/slices/iocSlice';
import { iocService } from '../../services/ioc.service';
import type { IOCItem } from '../../types/ioc.types';
import { ReputationBadge } from '../../components/ioc/ReputationBadge';
import { IOCFiltersToolbar } from '../../components/ioc/IOCFilters';
import { IOCTableSkeleton, IOCStatsSkeleton } from '../../components/ioc/IOCSkeletons';
import { StatCard } from '../../components/dashboard/StatCard';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

export const IOCExplorerPage: React.FC = () => {
  const navigate = navigateFn();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const filters = useAppSelector((s) => s.ioc.filters);
  const currentPage = useAppSelector((s) => s.ioc.currentPage);
  const pageSize = useAppSelector((s) => s.ioc.pageSize);

  const [iocs, setIocs] = useState<IOCItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await iocService.getIocs(filters, currentPage, pageSize);
      setIocs(result.items);
      setTotal(result.total);
    } catch {
      setError('Failed to query IOC datastore.');
      toast.error('Threat indicator repository synchronization failed.');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchIocs();
  }, [fetchIocs]);

  function navigateFn() {
    return useNavigate();
  }

  const handleRowClick = (id: string) => {
    navigate(`/ioc-explorer/${id}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl font-sans text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
          <Server className="h-6 w-6 text-primary-blue dark:text-primary-sky" />
          IOC Indicator Explorer
        </h1>
        <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
          Investigate network, host, and file indicators mapped across internal audits and vendor threat feeds.
        </p>
      </div>

      {/* Stats Cards */}
      {loading && iocs.length === 0 ? (
        <IOCStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Indicators"
            metric={total}
            icon={Server}
            variant="primary"
          />
          <StatCard
            title="Malicious Reputation"
            metric={iocs.filter((i) => i.reputation === 'malicious').length}
            icon={ShieldAlert}
            variant="danger"
          />
          <StatCard
            title="Suspicious Reputation"
            metric={iocs.filter((i) => i.reputation === 'suspicious').length}
            icon={ShieldAlert}
            variant="warning"
          />
          <StatCard
            title="Whitelisted"
            metric={iocs.filter((i) => i.status === 'whitelist').length}
            icon={ShieldCheck}
            variant="success"
          />
        </div>
      )}

      {/* Filter toolbar */}
      <IOCFiltersToolbar total={total} loading={loading} onRefresh={fetchIocs} />

      {/* Main Table View */}
      {loading && iocs.length === 0 ? (
        <IOCTableSkeleton />
      ) : error ? (
        <div className="text-center p-12 bg-severity-critical/5 rounded-card border border-severity-critical/20">
          <ShieldAlert className="h-10 w-10 text-severity-critical mx-auto mb-3" />
          <h3 className="text-sm font-bold text-severity-critical mb-1">Telemetry Synchronization Failed</h3>
          <p className="text-xs text-light-text-muted mb-4">Verification timeout while connecting to indicators server.</p>
          <Button size="sm" variant="outline" onClick={fetchIocs} className="mx-auto">
            Retry Connection
          </Button>
        </div>
      ) : iocs.length === 0 ? (
        <div className="text-center p-12 bg-light-bg-secondary/40 dark:bg-dark-bg-card/20 rounded-card border border-dashed border-gray-300 dark:border-gray-700">
          <ShieldCheck className="h-10 w-10 text-light-text-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-1">No Indicators Mapped</h3>
          <p className="text-xs text-light-text-muted mb-4">No threat indicators found matching current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-800 rounded-card overflow-hidden bg-white dark:bg-dark-bg-card shadow-small">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" aria-label="Indicators of Compromise database table">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-bg-secondary/30 font-bold uppercase tracking-wider text-[10px] text-light-text-muted dark:text-dark-text-muted">
                    <th className="py-3 px-4 min-w-[200px]">Indicator Value</th>
                    <th className="py-3 px-4 w-32">Type</th>
                    <th className="py-3 px-4 w-36 text-center">Reputation</th>
                    <th className="py-3 px-4 w-28 text-center">Confidence</th>
                    <th className="py-3 px-4 w-40">Source Feed</th>
                    <th className="py-3 px-4 w-28 text-center">Related Threats</th>
                    <th className="py-3 px-4 w-32">Last Seen</th>
                    <th className="py-3 px-4 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {iocs.map((ioc) => (
                    <tr
                      key={ioc.id}
                      onClick={() => handleRowClick(ioc.id)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-light-text-primary dark:text-dark-text-primary break-all">
                        {ioc.value}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded-badge bg-primary-blue/8 dark:bg-primary-sky/8 border border-primary-blue/15 dark:border-primary-sky/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-blue dark:text-primary-sky">
                          {ioc.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <ReputationBadge reputation={ioc.reputation} />
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-light-text-primary dark:text-dark-text-primary">
                        {ioc.confidence}%
                      </td>
                      <td className="py-3.5 px-4 text-light-text-secondary dark:text-dark-text-secondary font-medium">
                        {ioc.source}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-light-text-primary dark:text-dark-text-primary">
                        {ioc.threatCount}
                      </td>
                      <td className="py-3.5 px-4 text-light-text-muted dark:text-dark-text-muted font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ioc.lastSeen).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRowClick(ioc.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-muted hover:text-primary-blue dark:hover:text-primary-sky transition-colors mx-auto"
                          aria-label={`View IOC details for ${ioc.value}`}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination control */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
              <span className="text-xs text-light-text-muted">
                Showing Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IOCExplorerPage;
