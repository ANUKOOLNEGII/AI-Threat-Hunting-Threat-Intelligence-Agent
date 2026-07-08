import React, { useCallback } from 'react';
import { Search, SlidersHorizontal, RefreshCw, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setFilter, resetFilters } from '../../redux/slices/threatsSlice';
import type { ThreatFilters, ThreatSeverity, ThreatCategory, ThreatStatus } from '../../types/threat.types';

interface ThreatFeedToolbarProps {
  total: number;
  loading: boolean;
  onRefresh: () => void;
}

const SEVERITIES: Array<{ value: ThreatSeverity | 'all'; label: string }> = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'informational', label: 'Informational' },
];

const CATEGORIES: Array<{ value: ThreatCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'vulnerability', label: 'Vulnerability' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'malware', label: 'Malware' },
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'apt', label: 'APT' },
  { value: 'zero-day', label: 'Zero-Day' },
  { value: 'advisory', label: 'Advisory' },
];

const STATUSES: Array<{ value: ThreatStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

const SORT_OPTIONS: Array<{ value: ThreatFilters['sortBy']; label: string }> = [
  { value: 'publishedAt', label: 'Published Date' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'severity', label: 'Severity' },
  { value: 'title', label: 'Title (A–Z)' },
];

function SelectFilter<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={ariaLabel}
        className="appearance-none h-10 pl-3 pr-8 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue cursor-pointer transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted"
        aria-hidden="true"
      />
    </div>
  );
}

export const ThreatFeedToolbar: React.FC<ThreatFeedToolbarProps> = ({
  total,
  loading,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.threats.filters);

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
    filters.severity !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.source !== 'all';

  return (
    <div
      className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-3 shadow-small space-y-3"
      role="search"
      aria-label="Threat feed search and filters"
    >
      {/* Row 1: search + refresh */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted dark:text-dark-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.query}
            onChange={handleQuery}
            placeholder="Search threats, CVEs, actors, tags…"
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-input border border-gray-200 dark:border-gray-700 bg-light-bg-secondary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-primary-blue"
            aria-label="Search threat feed"
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

        {/* Refresh */}
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          loading={loading}
          aria-label="Refresh threat feed"
          className="gap-1.5 shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        {/* Reset filters */}
        {isFiltered && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch(resetFilters())}
            aria-label="Reset all filters"
            className="gap-1.5 shrink-0 text-severity-critical hover:bg-severity-critical/10"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>

      {/* Row 2: filter selects */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-light-text-muted shrink-0" aria-hidden="true" />

        <SelectFilter
          value={filters.severity}
          options={SEVERITIES}
          onChange={(v) => dispatch(setFilter({ key: 'severity', value: v }))}
          ariaLabel="Filter by severity"
        />
        <SelectFilter
          value={filters.category}
          options={CATEGORIES}
          onChange={(v) => dispatch(setFilter({ key: 'category', value: v }))}
          ariaLabel="Filter by category"
        />
        <SelectFilter
          value={filters.status}
          options={STATUSES}
          onChange={(v) => dispatch(setFilter({ key: 'status', value: v }))}
          ariaLabel="Filter by status"
        />

        <div className="ml-auto flex items-center gap-2">
          <SelectFilter
            value={filters.sortBy}
            options={SORT_OPTIONS}
            onChange={(v) => dispatch(setFilter({ key: 'sortBy', value: v }))}
            ariaLabel="Sort by"
          />
          <button
            onClick={() =>
              dispatch(
                setFilter({ key: 'sortDir', value: filters.sortDir === 'asc' ? 'desc' : 'asc' })
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-light-text-muted"
            aria-label={`Sort direction: ${filters.sortDir === 'asc' ? 'ascending' : 'descending'}`}
            title={filters.sortDir === 'asc' ? 'Ascending — click to reverse' : 'Descending — click to reverse'}
          >
            <span className="text-xs font-bold select-none">
              {filters.sortDir === 'asc' ? '↑' : '↓'}
            </span>
          </button>
        </div>
      </div>

      {/* Row 3: result count */}
      <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted" aria-live="polite" aria-atomic="true">
        {loading ? 'Fetching threats…' : `${total} threat${total !== 1 ? 's' : ''} found`}
        {isFiltered && ' (filtered)'}
      </p>
    </div>
  );
};

export default ThreatFeedToolbar;
