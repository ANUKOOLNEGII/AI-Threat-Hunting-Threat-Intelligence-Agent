import React from 'react';
import { X, Bell, CheckSquare, Trash2 } from 'lucide-react';
import type { ThreatNotification } from '../../types/settings.types';
import { NotificationCard } from './NotificationCard';
import { NotificationSkeleton } from './SettingsSkeletons';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ThreatNotification[];
  loading?: boolean;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onReadAll: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen, onClose, notifications, loading = false,
  onRead, onArchive, onDelete, onReadAll, onClearAll
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-dark-bg-card border-l border-gray-200 dark:border-gray-800 shadow-medium flex flex-col h-full animate-slide-in" role="dialog" aria-modal="true" aria-label="Notification Center Drawer">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
          <h2 className="text-sm font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
            Alert Logs
          </h2>
          {unreadCount > 0 && (
            <span className="text-[10px] font-black bg-severity-critical text-white rounded-badge px-2 py-0.5 animate-pulse">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-hover text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          aria-label="Close notifications drawer"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Toolbar operations */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800/60 bg-light-bg-secondary/40 dark:bg-dark-bg-secondary/20 flex items-center justify-between gap-2">
          <button
            onClick={onReadAll}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Mark all read
          </button>
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-severity-critical hover:underline transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all logs
          </button>
        </div>
      )}

      {/* Content list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-light-text-muted">
            <Bell className="h-10 w-10 mb-2 opacity-40" />
            <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">System Clear</h4>
            <p className="text-[11px] mt-1">No indicators or security notifications logged currently.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onRead={onRead}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <style>{`
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-in { animation: none; }
        }
      `}</style>
    </div>
  );
};
export default NotificationDrawer;
