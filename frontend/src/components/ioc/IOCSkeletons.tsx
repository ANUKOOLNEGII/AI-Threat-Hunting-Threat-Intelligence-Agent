import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} />
);

export const IOCTableSkeleton: React.FC = () => (
  <div className="w-full border border-gray-200 dark:border-gray-800 rounded-card overflow-hidden bg-white dark:bg-dark-bg-card" aria-busy="true">
    <div className="h-10 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between">
      <Shimmer className="h-4 w-1/4" />
      <Shimmer className="h-4 w-1/12" />
      <Shimmer className="h-4 w-1/12" />
      <Shimmer className="h-4 w-1/12" />
      <Shimmer className="h-4 w-1/12" />
    </div>
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 px-4 flex items-center justify-between">
          <Shimmer className="h-4 w-48" />
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-5 w-16" />
          <Shimmer className="h-4 w-12" />
          <Shimmer className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const IOCDetailsSkeleton: React.FC = () => (
  <div className="space-y-6" aria-busy="true">
    <div className="space-y-2">
      <Shimmer className="h-4 w-16" />
      <Shimmer className="h-6 w-1/2" />
      <Shimmer className="h-4 w-3/4" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="border border-gray-200 dark:border-gray-800 p-5 rounded-card space-y-3">
          <Shimmer className="h-4 w-1/4" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-5/6" />
        </div>
      </div>
      <div className="border border-gray-200 dark:border-gray-800 p-5 rounded-card space-y-3">
        <Shimmer className="h-4 w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 py-2">
            <Shimmer className="h-4 w-4 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-2 w-12" />
              <Shimmer className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const IOCStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="border border-gray-200 dark:border-gray-800 p-4 rounded-card space-y-2 bg-white dark:bg-dark-bg-card">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-6 w-12" />
      </div>
    ))}
  </div>
);
