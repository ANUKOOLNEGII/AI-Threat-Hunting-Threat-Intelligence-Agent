import React from 'react';

/* ── Shimmer base ────────────────────────────────────────── */
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} />
);

/* ── ThreatCardSkeleton ──────────────────────────────────── */
export const ThreatCardSkeleton: React.FC = () => (
  <div
    className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-5 space-y-4 overflow-hidden"
    aria-busy="true"
    aria-label="Loading threat card"
  >
    {/* top accent */}
    <Shimmer className="h-0.5 w-full -mx-5 -mt-5 mb-0 rounded-none" />
    {/* badges row */}
    <div className="flex gap-2 pt-2">
      <Shimmer className="h-5 w-16" />
      <Shimmer className="h-5 w-20" />
      <Shimmer className="h-5 w-24" />
    </div>
    {/* title */}
    <Shimmer className="h-4 w-5/6" />
    <Shimmer className="h-3 w-4/6" />
    {/* summary */}
    <Shimmer className="h-3 w-full" />
    <Shimmer className="h-3 w-3/4" />
    {/* tags */}
    <div className="flex gap-1.5">
      <Shimmer className="h-4 w-12" />
      <Shimmer className="h-4 w-16" />
      <Shimmer className="h-4 w-14" />
    </div>
    {/* footer */}
    <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
      <Shimmer className="h-3 w-24" />
      <Shimmer className="h-3 w-12" />
    </div>
  </div>
);

/* ── ThreatFeedSkeleton ──────────────────────────────────── */
export const ThreatFeedSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div
    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    aria-busy="true"
    aria-label="Loading threat feed"
  >
    {Array.from({ length: count }).map((_, i) => (
      <ThreatCardSkeleton key={i} />
    ))}
  </div>
);

/* ── ThreatDetailsSkeleton ───────────────────────────────── */
export const ThreatDetailsSkeleton: React.FC = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading threat details">
    {/* header */}
    <div className="space-y-3">
      <div className="flex gap-2">
        <Shimmer className="h-5 w-16" />
        <Shimmer className="h-5 w-20" />
      </div>
      <Shimmer className="h-7 w-3/4" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-5/6" />
    </div>

    {/* 2-col grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* main col */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-card border border-gray-200 dark:border-gray-800 p-5 space-y-3">
          <Shimmer className="h-4 w-1/4" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
        </div>
        <div className="rounded-card border border-gray-200 dark:border-gray-800 p-5 space-y-4">
          <Shimmer className="h-4 w-1/4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Shimmer className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-3 w-1/3" />
                <Shimmer className="h-2 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* side col */}
      <div className="space-y-4">
        <div className="rounded-card border border-gray-200 dark:border-gray-800 p-5 space-y-3">
          <Shimmer className="h-4 w-1/3" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <Shimmer className="h-4 w-4 shrink-0" />
              <div className="flex-1 space-y-1">
                <Shimmer className="h-2 w-16" />
                <Shimmer className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-card border border-gray-200 dark:border-gray-800 p-5 space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Shimmer key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ── ThreatMetadataSkeleton ──────────────────────────────── */
export const ThreatMetadataSkeleton: React.FC = () => (
  <div className="space-y-0" aria-busy="true">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="flex gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <Shimmer className="h-4 w-4 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-2 w-14" />
          <Shimmer className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
