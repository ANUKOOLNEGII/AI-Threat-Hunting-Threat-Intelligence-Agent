import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} aria-hidden="true" />
);

/* Report list/grid shimmer loader */
export const ReportListSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading reports">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
        <div className="space-y-2">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-1/3" />
        </div>
        <Shimmer className="h-10 w-full" />
        <div className="flex justify-between items-center pt-2">
          <Shimmer className="h-3 w-1/4" />
          <div className="flex gap-2">
            <Shimmer className="h-6 w-12" />
            <Shimmer className="h-6 w-6 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* Report preview details loader */
export const ReportPreviewSkeleton: React.FC = () => (
  <div className="space-y-6 p-6 max-w-4xl mx-auto" aria-busy="true" aria-label="Loading report preview">
    <div className="space-y-3 pb-5 border-b border-gray-200 dark:border-gray-800">
      <Shimmer className="h-7 w-2/3" />
      <div className="flex gap-3">
        <Shimmer className="h-4.5 w-24" />
        <Shimmer className="h-4.5 w-32" />
      </div>
    </div>
    <div className="space-y-4">
      <Shimmer className="h-4 w-1/4" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Shimmer className="h-48 w-full rounded-card" />
      <Shimmer className="h-48 w-full rounded-card" />
    </div>
  </div>
);

/* Notification center/drawer loader */
export const NotificationSkeleton: React.FC = () => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading alerts">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex gap-3 p-3 rounded-card border border-gray-150 dark:border-gray-850 bg-white dark:bg-dark-bg-card">
        <Shimmer className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Shimmer className="h-3.5 w-1/3" />
            <Shimmer className="h-3 w-16" />
          </div>
          <Shimmer className="h-3 w-5/6" />
        </div>
      </div>
    ))}
  </div>
);

/* Profile dashboard loader */
export const ProfileSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading user profile">
    <div className="lg:col-span-1 p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex flex-col items-center space-y-4">
      <Shimmer className="h-24 w-24 rounded-full" />
      <Shimmer className="h-4.5 w-1/2" />
      <Shimmer className="h-3.5 w-1/3" />
      <Shimmer className="h-8 w-full" />
    </div>
    <div className="lg:col-span-2 p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-6">
      <div className="space-y-2">
        <Shimmer className="h-4 w-1/4" />
        <Shimmer className="h-8 w-full" />
      </div>
      <div className="space-y-2">
        <Shimmer className="h-4 w-1/4" />
        <Shimmer className="h-8 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Shimmer className="h-16 w-full" />
        <Shimmer className="h-16 w-full" />
      </div>
    </div>
  </div>
);

/* System Settings page loader */
export const SettingsSkeleton: React.FC = () => (
  <div className="space-y-6 max-w-3xl" aria-busy="true" aria-label="Loading configuration preferences">
    <div className="space-y-4">
      <Shimmer className="h-5 w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Shimmer className="h-20 w-full" />
        <Shimmer className="h-20 w-full" />
        <Shimmer className="h-20 w-full" />
      </div>
    </div>
    <div className="space-y-4">
      <Shimmer className="h-5 w-1/4" />
      <Shimmer className="h-8 w-full" />
      <Shimmer className="h-8 w-full" />
    </div>
  </div>
);
