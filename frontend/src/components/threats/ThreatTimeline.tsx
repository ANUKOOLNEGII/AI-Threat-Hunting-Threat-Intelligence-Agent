import React from 'react';
import {
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import type { ThreatTimelineEvent } from '../../types/threat.types';

interface ThreatTimelineProps {
  events: ThreatTimelineEvent[];
  loading?: boolean;
}

const EVENT_CONFIG: Record<
  ThreatTimelineEvent['type'],
  { icon: React.FC<{ className?: string }>; color: string; ring: string }
> = {
  published:  { icon: FileCheck,    color: 'text-severity-info',     ring: 'ring-severity-info/20 bg-severity-info/10' },
  collected:  { icon: Download,     color: 'text-primary-blue',      ring: 'ring-primary-blue/20 bg-primary-blue/10' },
  analyzed:   { icon: AlertCircle,  color: 'text-severity-medium',   ring: 'ring-severity-medium/20 bg-severity-medium/10' },
  updated:    { icon: RefreshCw,    color: 'text-severity-low',      ring: 'ring-severity-low/20 bg-severity-low/10' },
  closed:     { icon: FileCheck,    color: 'text-gray-400',          ring: 'ring-gray-200 bg-gray-100 dark:bg-gray-800 dark:ring-gray-700' },
  escalated:  { icon: ArrowUpRight, color: 'text-severity-critical', ring: 'ring-severity-critical/20 bg-severity-critical/10' },
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const TimelineSkeleton: React.FC = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading timeline">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="mt-1 flex-1 w-0.5 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="flex-1 pb-6 space-y-2">
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-2 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-2 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    ))}
  </div>
);

export const ThreatTimeline: React.FC<ThreatTimelineProps> = ({ events, loading = false }) => {
  if (loading) return <TimelineSkeleton />;

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-light-text-muted dark:text-dark-text-muted">
        <Clock className="h-8 w-8 mb-2 opacity-40" aria-hidden="true" />
        <p className="font-semibold">No timeline events recorded.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-0" aria-label="Threat timeline">
      {events.map((event, idx) => {
        const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.published;
        const Icon = config.icon;
        const isLast = idx === events.length - 1;

        return (
          <li key={event.id} className="flex gap-4">
            {/* Icon + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${config.ring}`}
                aria-hidden="true"
              >
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              {!isLast && (
                <div className="mt-1 flex-1 w-px bg-gray-200 dark:bg-gray-700 min-h-[2rem]" aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${!isLast ? 'pb-6' : 'pb-1'}`}>
              <p className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">
                {event.title}
              </p>
              <p className="mt-0.5 text-[11px] text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                {event.description}
              </p>
              <time
                dateTime={event.timestamp}
                className="mt-1 block text-[10px] text-light-text-muted dark:text-dark-text-muted"
              >
                {formatDateTime(event.timestamp)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ThreatTimeline;
