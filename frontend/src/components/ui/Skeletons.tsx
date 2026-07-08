import React from 'react';
import { Spinner } from './Feedback';

// 1. Shimmer base wrapper
const ShimmerBlock: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} />;
};

// 2. Card Skeleton Loading Layout
export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-card border border-gray-200 dark:border-gray-850 p-5 bg-white dark:bg-dark-bg-card space-y-4">
      <ShimmerBlock className="h-4 w-1/3" />
      <ShimmerBlock className="h-3 w-3/4" />
      <div className="space-y-2 pt-2">
        <ShimmerBlock className="h-2 w-full" />
        <ShimmerBlock className="h-2 w-full" />
        <ShimmerBlock className="h-2 w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
        <ShimmerBlock className="h-5 w-16" />
        <ShimmerBlock className="h-5 w-10" />
      </div>
    </div>
  );
};

// 3. Table Skeleton Loading Layout
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card overflow-hidden">
      {/* Header Row */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary/40 gap-4">
        <ShimmerBlock className="h-4 w-1/4" />
        <ShimmerBlock className="h-4 w-1/6" />
        <ShimmerBlock className="h-4 w-1/6" />
        <ShimmerBlock className="h-4 w-1/5" />
      </div>
      {/* Table Body Rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex px-6 py-4 gap-4 items-center">
            <ShimmerBlock className="h-3 w-1/4" />
            <ShimmerBlock className="h-3 w-1/6" />
            <ShimmerBlock className="h-3 w-1/6" />
            <ShimmerBlock className="h-3 w-1/5" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Chart Skeleton Loading Layout
export const ChartSkeleton: React.FC = () => {
  return (
    <div className="rounded-card border border-gray-200 dark:border-gray-850 p-5 bg-white dark:bg-dark-bg-card space-y-4">
      <div className="flex justify-between items-center">
        <ShimmerBlock className="h-4 w-1/4" />
        <ShimmerBlock className="h-3 w-16" />
      </div>
      {/* Mock analytical graph blocks */}
      <div className="flex h-48 items-end gap-2 pt-4 justify-between">
        <ShimmerBlock className="w-full h-[30%]" />
        <ShimmerBlock className="w-full h-[55%]" />
        <ShimmerBlock className="w-full h-[45%]" />
        <ShimmerBlock className="w-full h-[80%]" />
        <ShimmerBlock className="w-full h-[65%]" />
        <ShimmerBlock className="w-full h-[90%]" />
      </div>
    </div>
  );
};

// 5. PageLoader Component (spinning indicator centered)
export const PageLoader: React.FC = () => {
  return (
    <div className="flex h-[300px] w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
};

// 6. LoadingScreen Component (full screen overlay)
export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary transition-colors duration-200">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <span className="text-xs font-semibold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted animate-pulse">
          Decrypting Systems...
        </span>
      </div>
    </div>
  );
};

// 7. Route Suspense Loading Fallback
export const SuspenseLoader: React.FC = () => {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <ShimmerBlock className="h-8 w-1/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={4} />
    </div>
  );
};
