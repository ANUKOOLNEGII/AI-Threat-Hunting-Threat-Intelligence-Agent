import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, Award, Calendar, Layers, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setCurrentPage } from '../../redux/slices/cveSlice';
import { cveService } from '../../services/cve.service';
import type { CVEItem } from '../../types/cve.types';
import { CVSSBadge } from '../../components/cve/CVSSBadge';
import { CVEFiltersToolbar } from '../../components/cve/CVEFilters';
import { CVETableSkeleton, CVEStatsSkeleton } from '../../components/cve/CVESkeletons';
import { StatCard } from '../../components/dashboard/StatCard';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

export const CVEExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const filters = useAppSelector((s) => s.cve.filters);
  const currentPage = useAppSelector((s) => s.cve.currentPage);
  const pageSize = useAppSelector((s) => s.cve.pageSize);

  const [cves, setCves] = useState<CVEItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cveService.getCves(filters, currentPage, pageSize);
      setCves(result.items);
      setTotal(result.total);
    } catch {
      setError('Failed to query CVE datastore.');
      toast.error('Vulnerability database synchronization failed.');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchCves();
  }, [fetchCves]);

  const handleRowClick = (cveId: string) => {
    navigate(`/cve-explorer/${cveId}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl font-sans text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary-blue dark:text-primary-sky" />
          CVE Vulnerability Explorer
        </h1>
        <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
          Search, filter, and inspect Common Vulnerabilities and Exposures indexed in NVD and CISA catalogs.
        </p>
      </div>

      {/* Stats row */}
      {loading && cves.length === 0 ? (
        <CVEStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total CVEs Indexed"
            metric={total}
            icon={ShieldAlert}
            variant="primary"
          />
          <StatCard
            title="Known Exploited (KEV)"
            metric={cves.filter((c) => c.isExploited).length}
            icon={Award}
            variant="danger"
          />
          <StatCard
            title="Critical Severity"
            metric={cves.filter((c) => c.severity === 'critical').length}
            icon={Layers}
            variant="danger"
          />
          <StatCard
            title="High Severity"
            metric={cves.filter((c) => c.severity === 'high').length}
            icon={Layers}
            variant="warning"
          />
        </div>
      )}

      {/* Filters */}
      <CVEFiltersToolbar total={total} loading={loading} onRefresh={fetchCves} />

      {/* Main Table */}
      {loading && cves.length === 0 ? (
        <CVETableSkeleton />
      ) : error ? (
        <div className="text-center p-12 bg-severity-critical/5 rounded-card border border-severity-critical/20">
          <AlertCircle className="h-10 w-10 text-severity-critical mx-auto mb-3" />
          <h3 className="text-sm font-bold text-severity-critical mb-1">Failed to Sync CVE Records</h3>
          <p className="text-xs text-light-text-muted mb-4">Please verify your internet connection or try again.</p>
          <Button size="sm" variant="outline" onClick={fetchCves} className="mx-auto">
            Retry Connection
          </Button>
        </div>
      ) : cves.length === 0 ? (
        <div className="text-center p-12 bg-light-bg-secondary/40 dark:bg-dark-bg-card/20 rounded-card border border-dashed border-gray-300 dark:border-gray-700">
          <ShieldAlert className="h-10 w-10 text-light-text-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-1">No Matching CVEs Found</h3>
          <p className="text-xs text-light-text-muted mb-4">Adjust your queries or severity filters and try searching again.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-800 rounded-card overflow-hidden bg-white dark:bg-dark-bg-card shadow-small">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" aria-label="CVE Vulnerability database table">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-bg-secondary/30 font-bold uppercase tracking-wider text-[10px] text-light-text-muted dark:text-dark-text-muted">
                    <th className="py-3 px-4 w-36">CVE ID</th>
                    <th className="py-3 px-4 min-w-[200px]">Description</th>
                    <th className="py-3 px-4 w-40">Vendor / Product</th>
                    <th className="py-3 px-4 w-28 text-center">CVSS Score</th>
                    <th className="py-3 px-4 w-32 text-center">Exploited</th>
                    <th className="py-3 px-4 w-32">Published</th>
                    <th className="py-3 px-4 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {cves.map((cve) => (
                    <tr
                      key={cve.cveId}
                      onClick={() => handleRowClick(cve.cveId)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-light-text-primary dark:text-dark-text-primary">
                        {cve.cveId}
                      </td>
                      <td className="py-3.5 px-4 text-light-text-secondary dark:text-dark-text-secondary">
                        <div className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-0.5 line-clamp-1">
                          {cve.title}
                        </div>
                        <div className="line-clamp-2 leading-relaxed text-[11px]">
                          {cve.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                          {cve.vendor}
                        </div>
                        <div className="text-[10px] text-light-text-muted dark:text-dark-text-muted">
                          {cve.product}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <CVSSBadge score={cve.cvssScore} severity={cve.severity} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {cve.isExploited ? (
                          <span className="inline-flex items-center rounded-badge bg-severity-critical/10 text-severity-critical border border-severity-critical/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Yes (KEV)
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-badge bg-gray-100 dark:bg-gray-800 text-light-text-muted dark:text-dark-text-muted border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-light-text-muted dark:text-dark-text-muted font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(cve.publishedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRowClick(cve.cveId)}
                          className="flex h-7 w-7 items-center justify-center rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-muted hover:text-primary-blue dark:hover:text-primary-sky transition-colors mx-auto"
                          aria-label={`View CVE ${cve.cveId} Details`}
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

          {/* Pagination */}
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

export default CVEExplorerPage;
