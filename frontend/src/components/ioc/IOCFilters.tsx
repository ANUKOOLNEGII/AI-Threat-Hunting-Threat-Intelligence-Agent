import React, { useCallback } from 'react';
import { Search, SlidersHorizontal, RefreshCw, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setFilter, resetFilters } from '../../redux/slices/iocSlice';
import type { IOCType, IOCReputation, IOCStatus } from '../../types/ioc.types';

interface IOCFiltersToolbarProps {
  total: number;
  loading: boolean;
  onRefresh: () => void;
}

const TYPES: Array<{ value: IOCType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'ip', label: 'IP Address' },
  { value: 'domain', label: 'Domain' },
  { value: 'url', label: 'URL' },
  { value: 'sha256', label: 'SHA256' },
  { value: 'sha1', label: 'SHA1' },
  { value: 'md5', label: 'MD5' },
  { value: 'email', label: 'Email' },
  { value: 'registry', label: 'Registry Key' },
  { value: 'file', label: 'File Path' }
];

const REPUTATIONS: Array<{ value: IOCReputation | 'all'; label: string }> = [
  { value: 'all', label: 'All Reputations' },
  { value: 'malicious', label: 'Malicious' },
  { value: 'suspicious', label: 'Suspicious' },
  { value: 'trusted', label: 'Trusted' },
  { value: 'unknown', label: 'Unknown' }
];

const STATUSES: Array<{ value: IOCStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'mitigated', label: 'Mitigated' },
  { value: 'false-positive', label: 'False Positive' },
  { value: 'whitelist', label: 'Whitelist' }
];

export const IOCFiltersToolbar: React.FC<IOCFiltersToolbarProps> = ({
  total,
  loading,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.ioc.filters);

  const handleQuery = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setFilter({ key: 'query', value: e.target.value }));
    },
    [dispatch]
  );

  const handleClearQuery = useCallback(() => {
    dispatch(setFilter({ key: 'query', value: '' }));
  }, [dispatch]);

  const isFiltered =
    filters.query !== '' ||
    filters.type !== 'all' ||
    filters.reputation !== 'all' ||
    filters.status !== 'all';

  return (
    <div
      className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-4 shadow-small space-y-3"
      role="search"
      aria-label="IOC search and filters"
    >
      {/* Query input */}
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
            placeholder="Search indicator value, source, descriptions..."
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-input border border-gray-200 dark:border-gray-700 bg-light-bg-secondary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-primary-blue"
            aria-label="Search IOC feed"
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
            aria-label="Refresh IOC list"
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

      {/* Selects toolbar */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-light-text-muted">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>Filters:</span>
        </div>

        {/* IOC Type */}
        <div className="relative">
          <select
            value={filters.type}
            onChange={(e) => dispatch(setFilter({ key: 'type', value: e.target.value as IOCType | 'all' }))}
            aria-label="Filter by IOC type"
            className="appearance-none h-10 pl-3 pr-8 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue cursor-pointer transition-all"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted" aria-hidden="true" />
        </div>

        {/* Reputation */}
        <div className="relative">
          <select
            value={filters.reputation}
            onChange={(e) => dispatch(setFilter({ key: 'reputation', value: e.target.value as IOCReputation | 'all' }))}
            aria-label="Filter by reputation"
            className="appearance-none h-10 pl-3 pr-8 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue cursor-pointer transition-all"
          >
            {REPUTATIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted" aria-hidden="true" />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => dispatch(setFilter({ key: 'status', value: e.target.value as IOCStatus | 'all' }))}
            aria-label="Filter by status"
            className="appearance-none h-10 pl-3 pr-8 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue cursor-pointer transition-all"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted" aria-hidden="true" />
        </div>
      </div>

      <div className="text-[11px] text-light-text-muted dark:text-dark-text-muted" aria-live="polite">
        {loading ? 'Querying threat telemetry datastore...' : `${total} IOC entry${total !== 1 ? 's' : ''} found`}
      </div>
    </div>
  );
};

export default IOCFiltersToolbar;
