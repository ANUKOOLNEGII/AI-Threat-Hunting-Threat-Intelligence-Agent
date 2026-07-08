import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} aria-hidden="true" />
);

/* Admin Overview/Table skeleton */
export const TableSkeleton: React.FC = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading details">
    <div className="flex justify-between items-center">
      <Shimmer className="h-8 w-1/4" />
      <Shimmer className="h-8 w-32" />
    </div>
    <div className="border border-gray-250 dark:border-gray-850 rounded-card overflow-hidden">
      <div className="bg-gray-50 dark:bg-dark-bg-secondary p-3 border-b border-gray-200 dark:border-gray-800 flex gap-4">
        <Shimmer className="h-4 w-1/6" />
        <Shimmer className="h-4 w-1/4" />
        <Shimmer className="h-4 w-1/6" />
        <Shimmer className="h-4 w-1/6" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 border-b border-gray-150 dark:border-gray-850 flex gap-4">
          <Shimmer className="h-4.5 w-1/6" />
          <Shimmer className="h-4.5 w-1/4" />
          <Shimmer className="h-4.5 w-1/6" />
          <Shimmer className="h-4.5 w-1/6" />
        </div>
      ))}
    </div>
  </div>
);

/* System Monitoring layout skeleton */
export const MonitoringSkeleton: React.FC = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading monitoring charts">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-2">
          <Shimmer className="h-3 w-1/2" />
          <Shimmer className="h-6 w-1/3" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Shimmer className="h-64 w-full rounded-card border border-gray-200 dark:border-gray-800" />
      <Shimmer className="h-64 w-full rounded-card border border-gray-200 dark:border-gray-800" />
    </div>
  </div>
);
