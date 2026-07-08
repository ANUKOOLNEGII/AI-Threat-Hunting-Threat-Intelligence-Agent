import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`} aria-hidden="true" />
);

/* Conversation list item skeleton */
export const ConversationItemSkeleton: React.FC = () => (
  <div className="p-3 space-y-1.5">
    <Shimmer className="h-3.5 w-4/5" />
    <Shimmer className="h-3 w-1/2" />
  </div>
);

/* Sidebar skeleton */
export const ConversationSidebarSkeleton: React.FC = () => (
  <div className="space-y-1 p-2" aria-busy="true" aria-label="Loading conversations">
    {[1, 2, 3, 4, 5].map((i) => <ConversationItemSkeleton key={i} />)}
  </div>
);

/* Typing indicator */
export const TypingSkeletonDots: React.FC = () => (
  <div className="flex items-center gap-1 px-1 py-0.5" aria-label="AI is generating a response">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2 w-2 rounded-full bg-primary-blue dark:bg-primary-sky"
        style={{
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </div>
);

/* AI response skeleton */
export const AIResponseSkeleton: React.FC = () => (
  <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading response">
    <Shimmer className="h-4 w-1/3" />
    <Shimmer className="h-3 w-full" />
    <Shimmer className="h-3 w-5/6" />
    <Shimmer className="h-3 w-4/5" />
    <div className="pt-2 space-y-2">
      <Shimmer className="h-4 w-1/4" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-3/4" />
    </div>
  </div>
);

/* Reference list skeleton */
export const ReferencesSkeleton: React.FC = () => (
  <div className="space-y-2 p-3" aria-busy="true">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-2 p-2">
        <Shimmer className="h-6 w-6 rounded shrink-0" />
        <div className="flex-1 space-y-1">
          <Shimmer className="h-3 w-2/3" />
          <Shimmer className="h-2.5 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
