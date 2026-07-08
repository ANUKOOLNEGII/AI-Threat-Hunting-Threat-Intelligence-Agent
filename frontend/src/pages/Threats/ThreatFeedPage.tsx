import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Rss, AlertCircle, RefreshCw, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setCurrentPage, resetFilters } from '../../redux/slices/threatsSlice';
import { threatsService } from '../../services/threats.service';
import type { ThreatItem } from '../../types/threat.types';
import { ThreatCard } from '../../components/threats/ThreatCard';
import { ThreatFeedToolbar } from '../../components/threats/ThreatFeedToolbar';
import { ThreatFeedSkeleton } from '../../components/threats/ThreatSkeletons';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

/* ── Feed statistics bar ─────────────────────────────────── */
const FEED_STATS = [
  { label: 'Critical', count: 2, color: 'text-severity-critical bg-severity-critical/10 border-severity-critical/20' },
  { label: 'High',     count: 2, color: 'text-severity-high bg-severity-high/10 border-severity-high/20' },
  { label: 'Medium',   count: 2, color: 'text-severity-medium bg-severity-medium/10 border-severity-medium/20' },
  { label: 'Sources',  count: 5, color: 'text-primary-blue dark:text-primary-sky bg-primary-blue/10 dark:bg-primary-sky/10 border-primary-blue/20 dark:border-primary-sky/20' },
];

/* ── Empty state ─────────────────────────────────────────── */
const EmptyState: React.FC<{ filtered: boolean; onReset: () => void }> = ({
  filtered,
  onReset,
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-card bg-light-bg-secondary/40 dark:bg-dark-bg-card/20">
    <ShieldOff
      className="h-12 w-12 text-light-text-muted dark:text-dark-text-muted mb-4 opacity-50"
      aria-hidden="true"
    />
    <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
      {filtered ? 'No Threats Match Your Filters' : 'No Threat Data Available'}
    </h3>
    <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-sm mb-5">
      {filtered
        ? 'Try adjusting your search query or filter criteria to find matching threats.'
        : 'The threat feed is currently empty. Check your feed sources or try refreshing.'}
    </p>
    {filtered && (
      <Button size="sm" variant="outline" onClick={onReset} className="gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        Reset Filters
      </Button>
    )}
  </div>
);

/* ── Error state ─────────────────────────────────────────── */
const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center border border-severity-critical/20 rounded-card bg-severity-critical/5">
    <AlertCircle className="h-12 w-12 text-severity-critical mb-4 opacity-70" aria-hidden="true" />
    <h3 className="text-sm font-bold text-severity-critical mb-1">Feed Load Failed</h3>
    <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-sm mb-5">
      Unable to retrieve threat intelligence data. Check your network connection or service status.
    </p>
    <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5">
      <RefreshCw className="h-3.5 w-3.5" />
      Retry
    </Button>
  </div>
);

/* ── Pagination ─────────────────────────────────────────── */
const Pagination: React.FC<{
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}> = ({ page, pageSize, total, onPage }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800"
      aria-label="Threat feed pagination"
    >
      <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
        Page {page} of {totalPages} · {total} threats
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="gap-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`h-7 w-7 rounded-button text-xs font-semibold transition-colors ${
              p === page
                ? 'bg-primary-blue text-white'
                : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-primary dark:text-dark-text-primary'
            }`}
          >
            {p}
          </button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="gap-1"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════════════
   ThreatFeedPage
═══════════════════════════════════════════════════════════ */
export const ThreatFeedPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const filters = useAppSelector((s) => s.threats.filters);
  const currentPage = useAppSelector((s) => s.threats.currentPage);
  const pageSize = useAppSelector((s) => s.threats.pageSize);

  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFiltered = useMemo(
    () =>
      filters.query !== '' ||
      filters.severity !== 'all' ||
      filters.category !== 'all' ||
      filters.status !== 'all' ||
      filters.source !== 'all',
    [filters]
  );

  const fetchThreats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await threatsService.getThreats(filters, currentPage, pageSize);
      setThreats(result.items);
      setTotal(result.total);
    } catch {
      setError('Failed to load threat intelligence feed.');
      toast.error('Threat feed sync failed.');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, toast]);

  // Fetch on filter / page change
  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  const handleBookmark = useCallback(
    (id: string) => {
      const t = threats.find((x) => x.id === id);
      toast.success(`"${t?.title ?? id}" bookmarked.`);
    },
    [threats, toast]
  );

  const handleAnalyze = useCallback(
    (id: string) => {
      toast.info(`AI analysis queued for threat ${id}. (Phase 6)`);
    },
    [toast]
  );

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary">
            <Rss className="h-5 w-5 text-primary-blue dark:text-primary-sky" aria-hidden="true" />
            Threat Intelligence Feed
          </h1>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
            Aggregated stream from NIST NVD, CISA KEV, and community advisories.
          </p>
        </div>

        {/* Feed statistics pills */}
        <div className="flex flex-wrap items-center gap-2" aria-label="Feed statistics">
          {FEED_STATS.map(({ label, count, color }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 rounded-badge border px-2.5 py-1 text-[11px] font-bold ${color}`}
              aria-label={`${count} ${label}`}
            >
              <span className="text-base leading-none">{count}</span>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <ThreatFeedToolbar
        total={total}
        loading={loading}
        onRefresh={fetchThreats}
      />

      {/* ── Feed Content ── */}
      {loading ? (
        <ThreatFeedSkeleton count={6} />
      ) : error ? (
        <ErrorState onRetry={fetchThreats} />
      ) : threats.length === 0 ? (
        <EmptyState filtered={isFiltered} onReset={() => dispatch(resetFilters())} />
      ) : (
        <>
          <section
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            aria-label={`${threats.length} threat results`}
          >
            {threats.map((threat) => (
              <ThreatCard
                key={threat.id}
                threat={threat}
                onBookmark={handleBookmark}
                onAnalyze={handleAnalyze}
              />
            ))}
          </section>

          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={total}
            onPage={(p) => dispatch(setCurrentPage(p))}
          />
        </>
      )}
    </div>
  );
};

export default ThreatFeedPage;
