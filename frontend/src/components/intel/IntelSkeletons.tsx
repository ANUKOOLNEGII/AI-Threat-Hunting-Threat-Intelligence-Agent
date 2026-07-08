import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} />
);

export const MalwareSkeleton: React.FC = () => (
  <div className="w-full space-y-4" aria-busy="true">
    <div className="flex gap-4">
      <Shimmer className="h-8 w-1/4" />
      <Shimmer className="h-8 w-1/6" />
    </div>
    <div className="border border-gray-200 dark:border-gray-800 rounded-card overflow-hidden bg-white dark:bg-dark-bg-card">
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 px-4 flex items-center justify-between">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-48" />
            <Shimmer className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/** Alias used by MalwareDashboardPage */
export const MalwareListSkeleton = MalwareSkeleton;

export const MalwareDetailsSkeleton: React.FC = () => (
  <div className="space-y-5" aria-busy="true">
    <Shimmer className="h-6 w-24" />
    <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-5 flex gap-4">
      <Shimmer className="h-12 w-12 rounded-card shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-6 w-1/3" />
        <Shimmer className="h-4 w-2/3" />
      </div>
    </div>
    <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-5 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <Shimmer className="h-4 w-36 shrink-0" />
          <Shimmer className="h-4 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const CampaignSkeleton: React.FC = () => (
  <div className="w-full space-y-4" aria-busy="true">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-800 p-4 rounded-card space-y-2 bg-white dark:bg-dark-bg-card">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-6 w-10" />
        </div>
      ))}
    </div>
    <div className="border border-gray-200 dark:border-gray-800 p-5 rounded-card space-y-3 bg-white dark:bg-dark-bg-card">
      <Shimmer className="h-4 w-1/4" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
    </div>
  </div>
);

/** Alias used by RansomwareDashboardPage */
export const RansomwareListSkeleton = CampaignSkeleton;

export const CampaignDetailsSkeleton: React.FC = () => (
  <div className="space-y-5" aria-busy="true">
    <Shimmer className="h-6 w-32" />
    <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-5 flex gap-4">
      <Shimmer className="h-12 w-12 rounded-card shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-6 w-1/3" />
        <Shimmer className="h-4 w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">
        <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Shimmer key={i} className="h-4 w-full" />)}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-5 space-y-3">
          {[1, 2].map((i) => <Shimmer key={i} className="h-6 w-20" />)}
        </div>
      </div>
    </div>
  </div>
);

export const PhishingSkeleton: React.FC = () => (
  <div className="space-y-6" aria-busy="true">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-gray-200 dark:border-gray-800 p-4 rounded-card space-y-3 bg-white dark:bg-dark-bg-card">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-8 w-full" />
        <Shimmer className="h-8 w-full" />
      </div>
      <div className="border border-gray-200 dark:border-gray-800 p-4 rounded-card space-y-3 bg-white dark:bg-dark-bg-card">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-8 w-full" />
        <Shimmer className="h-8 w-full" />
      </div>
    </div>
  </div>
);

/** Alias used by PhishingDashboardPage */
export const PhishingListSkeleton = PhishingSkeleton;

export const GraphSkeleton: React.FC = () => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-card p-6 min-h-[300px] flex flex-col justify-center items-center bg-white dark:bg-dark-bg-card space-y-3" aria-busy="true">
    <Shimmer className="h-8 w-8 rounded-full" />
    <Shimmer className="h-4 w-1/3" />
    <Shimmer className="h-3 w-1/2" />
  </div>
);

/** Alias used by ThreatCorrelationPage */
export const CorrelationSkeleton = GraphSkeleton;
