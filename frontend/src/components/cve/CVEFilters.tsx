import React, { useCallback } from 'react';
import { Search, SlidersHorizontal, RefreshCw, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setFilter, resetFilters } from '../../redux/slices/cveSlice';
import type { CVESeverity } from '../../types/cve.types';

interface CVEFiltersToolbarProps {
  total: number;
  loading: boolean;
  onRefresh: () => void;
}

const SEVERITIES: Array<{ value: CVESeverity | 'all'; label: string }> = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'informational', label: 'Informational' },
];

const EXPLOITATION_STATES: Array<{ value: boolean | 'all'; label: string }> = [
  { value: 'all', label: 'All Exploited Status' },
  { value: true, label: 'Known Exploited (KEV)' },
  { value: false, label: 'Not Known Exploited' },
];

export const CVEFiltersToolbar: React.FC<CVEFiltersToolbarProps> = ({
  total,
  loading,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.cve.filters);

  const handleQuery = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setFilter({ key: 'query', value: e.target.value }));
    },
    [dispatch]
  );

  const handleClearQuery = useCallback(() => {
    dispatch(setFilter({ key: 'query', value: '' }));
  }, [dispatch]);

  const handleVendor = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setFilter({ key: 'vendor', value: e.target.value }));
    },
    [dispatch]
  );

  const handleProduct = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setFilter({ key: 'product', value: e.target.value }));
    },
    [dispatch]
  );

  const isFiltered =
    filters.query !== '' ||
    filters.severity !== 'all' ||
    filters.isExploited !== 'all' ||
    filters.vendor !== '' ||
    filters.product !== '';

  return (
    <div
      className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-4 shadow-small space-y-3"
      role="search"
      aria-label="CVE search and filters"
    >
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted dark:text-dark-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.query}
            onChange={handleQuery}
            placeholder="Search CVE ID, vendor, product, keywords..."
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-input border border-gray-200 dark:border-gray-700 bg-light-bg-secondary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-primary-blue"
            aria-label="Search CVE feed"
            autoComplete="off"
            spellCheck={false}
          />
          {filters.query && (
            <button
              onClick={handleClearQuery}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-light-text-muted hover:text-light-text-primary transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            loading={loading}
            aria-label="Refresh CVE feed"
            className="gap-1.5 flex-1 sm:flex-none"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          {isFiltered && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatch(resetFilters())}
              aria-label="Reset all filters"
              className="gap-1.5 text-severity-critical hover:bg-severity-critical/10 flex-1 sm:flex-none"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filter Fields */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-light-text-muted">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>Filters:</span>
        </div>

        {/* Severity */}
        <div className="relative">
          <select
            value={filters.severity}
            onChange={(e) => dispatch(setFilter({ key: 'severity', value: e.target.value as CVESeverity | 'all' }))}
            aria-label="Filter by severity"
            className="appearance-none h-10 pl-3 pr-8 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue cursor-pointer transition-all"
          >
            {SEVERITIES.map((s) => (
              <option key={s.value.toString()} value={s.value.toString()}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted" aria-hidden="true" />
        </div>

        {/* Exploited Status */}
        <div className="relative">
          <select
            value={filters.isExploited === 'all' ? 'all' : filters.isExploited ? 'true' : 'false'}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : e.target.value === 'true';
              dispatch(setFilter({ key: 'isExploited', value: val }));
            }}
            aria-label="Filter by exploited status"
            className="appearance-none h-10 pl-3 pr-8 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue cursor-pointer transition-all"
          >
            {EXPLOITATION_STATES.map((e) => (
              <option key={e.value.toString()} value={e.value.toString()}>
                {e.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted" aria-hidden="true" />
        </div>

        {/* Vendor */}
        <input
          type="text"
          value={filters.vendor}
          onChange={handleVendor}
          placeholder="Vendor name..."
          className="h-10 px-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
          aria-label="Filter by vendor"
        />

        {/* Product */}
        <input
          type="text"
          value={filters.product}
          onChange={handleProduct}
          placeholder="Product name..."
          className="h-10 px-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
          aria-label="Filter by product"
        />
      </div>

      <div className="text-[11px] text-light-text-muted dark:text-dark-text-muted" aria-live="polite">
        {loading ? 'Querying CVE datastore...' : `${total} CVE record${total !== 1 ? 's' : ''} matched`}
      </div>
    </div>
  );
};

export default CVEFiltersToolbar;
