import React from 'react';
import { Clock, Eye, AlertTriangle, GitPullRequest, Bookmark } from 'lucide-react';
import type { IOCTimelineEvent } from '../../types/ioc.types';

interface IOCTimelineProps {
  events?: IOCTimelineEvent[];
}

const EVENT_CONFIG: Record<
  IOCTimelineEvent['type'],
  { icon: React.FC<{ className?: string }>; color: string; ring: string }
> = {
  'first-seen':  { icon: Eye,              color: 'text-primary-blue dark:text-primary-sky', ring: 'ring-primary-blue/20 bg-primary-blue/10 dark:ring-primary-sky/20 dark:bg-primary-sky/10' },
  updated:       { icon: Clock,            color: 'text-severity-info',                     ring: 'ring-severity-info/20 bg-severity-info/10' },
  matched:       { icon: AlertTriangle,    color: 'text-severity-medium',                   ring: 'ring-severity-medium/20 bg-severity-medium/10' },
  correlated:    { icon: GitPullRequest,   color: 'text-severity-critical',                 ring: 'ring-severity-critical/20 bg-severity-critical/10' },
  investigated:  { icon: Bookmark,         color: 'text-severity-low',                      ring: 'ring-severity-low/20 bg-severity-low/10' }
};

export const IOCTimeline: React.FC<IOCTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-light-text-muted dark:text-dark-text-muted">
        <Clock className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs font-semibold">No operational log history recorded for this indicator.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-0" aria-label="IOC activity timeline">
      {events.map((event, idx) => {
        const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.updated;
        const Icon = config.icon;
        const isLast = idx === events.length - 1;

        return (
          <li key={event.id} className="flex gap-4">
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
                {new Date(event.timestamp).toLocaleString()}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default IOCTimeline;
