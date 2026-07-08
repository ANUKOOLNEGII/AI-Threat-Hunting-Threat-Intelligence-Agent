import React, { useEffect, useState } from 'react';
import { Bell, CheckSquare, Trash2 } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import type { ThreatNotification } from '../../types/settings.types';
import { NotificationSkeleton } from '../../components/settings/SettingsSkeletons';
import { NotificationCard } from '../../components/settings/NotificationCard';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

export const NotificationCenterPage: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ThreatNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unread' | 'all' | 'archived'>('unread');

  useEffect(() => {
    settingsService.getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load alert log database.');
      setLoading(false);
    });
  }, [toast]);

  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    toast.success('Alert marked as read.');
  };

  const handleArchive = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isArchived: true } : item))
    );
    toast.success('Alert moved to archive.');
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    toast.success('Alert log deleted.');
  };

  const handleReadAll = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    toast.success('All alerts marked read.');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All alert logs purged.');
  };

  const filtered = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.isRead && !item.isArchived;
    if (activeTab === 'archived') return item.isArchived;
    return !item.isArchived; // 'all' tab shows unarchived notifications
  });

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length;

  return (
    <main className="space-y-6 px-4 py-6 max-w-4xl mx-auto">
      <PageHeader
        title="Notification Center"
        subtitle="Manage real-time indicator alerts, system syncs, and AI task statuses."
        action={
          notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleReadAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-button border border-gray-250 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors"
              >
                <CheckSquare className="h-4 w-4" />
                Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-button border border-severity-critical/20 bg-severity-critical/5 text-severity-critical hover:bg-severity-critical/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear Logs
              </button>
            </div>
          )
        }
      />

      {/* Tabs */}
      <section className="flex border-b border-gray-200 dark:border-gray-800">
        {(['unread', 'all', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? 'border-primary-blue dark:border-primary-sky text-primary-blue dark:text-primary-sky'
                : 'border-transparent text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary'
            }`}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 text-[9px] font-black bg-severity-critical text-white rounded-badge px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </section>

      {/* List */}
      <section className="space-y-4">
        {loading ? (
          <NotificationSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card">
            <Bell className="h-10 w-10 text-light-text-muted mx-auto mb-2 opacity-50" />
            <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">All System Clear</h3>
            <p className="text-[11px] text-light-text-muted mt-1">No alerts or logs currently categorized here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <NotificationCard
                key={item.id}
                notification={item}
                onRead={handleRead}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
export default NotificationCenterPage;
