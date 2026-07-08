import React from 'react';
import {
  Bell, ShieldAlert, Cpu, Bot, FileText, CheckCircle, Clock, Trash2, Archive
} from 'lucide-react';
import type { ThreatNotification } from '../../types/settings.types';

interface NotificationCardProps {
  notification: ThreatNotification;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<ThreatNotification['category'], React.FC<{ className?: string }>> = {
  alert: ShieldAlert,
  'threat-feed': Cpu,
  'ai-task': Bot,
  report: FileText,
  system: Bell,
};

const PRIORITY_CLASSES: Record<ThreatNotification['priority'], string> = {
  critical: 'bg-severity-critical/10 text-severity-critical border-severity-critical/30',
  high:     'bg-severity-high/10 text-severity-high border-severity-high/30',
  medium:   'bg-severity-medium/10 text-severity-medium border-severity-medium/30',
  low:      'bg-severity-info/10 text-severity-info border-severity-info/30',
  info:     'bg-positive-bg text-positive border-positive/30',
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification: item, onRead, onArchive, onDelete
}) => {
  const Icon = CATEGORY_ICONS[item.category] ?? Bell;

  return (
    <div className={`p-4 rounded-card border transition-all flex items-start gap-4 ${
      item.isRead
        ? 'border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-dark-bg-card/40 opacity-80'
        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg-card shadow-small'
    }`}>
      {/* Icon */}
      <div className={`p-2 rounded-full shrink-0 ${
        item.isRead ? 'bg-gray-100 dark:bg-gray-800 text-light-text-muted' : 'bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky'
      }`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Info details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_CLASSES[item.priority]}`}>
            {item.priority}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">
            {item.category.replace('-', ' ')}
          </span>
        </div>

        <h4 className={`text-xs font-bold text-light-text-primary dark:text-dark-text-primary ${item.isRead ? 'font-normal' : ''}`}>
          {item.title}
        </h4>
        
        <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center gap-1 mt-2 text-[10px] text-light-text-muted">
          <Clock className="h-3.5 w-3.5" />
          <time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString()}</time>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-1 shrink-0">
        {!item.isRead && (
          <button
            onClick={() => onRead(item.id)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-positive"
            title="Mark as read"
            aria-label="Mark as read"
          >
            <CheckCircle className="h-4.5 w-4.5" />
          </button>
        )}
        {!item.isArchived && (
          <button
            onClick={() => onArchive(item.id)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary"
            title="Archive alert"
            aria-label="Archive alert"
          >
            <Archive className="h-4.5 w-4.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 rounded hover:bg-severity-critical/10 text-light-text-muted hover:text-severity-critical"
          title="Delete alert log"
          aria-label="Delete alert log"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};
export default NotificationCard;
