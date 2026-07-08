import React, { useEffect, useState } from 'react';
import { Eye, Bell, Shield, Key } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import type { UserSettings } from '../../types/settings.types';
import { SettingsSkeleton } from '../../components/settings/SettingsSkeletons';
import { PageHeader } from '../../components/ui/States';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

export const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load platform settings data.');
      setLoading(false);
    });
  }, [toast]);

  const handleAppearanceTheme = async (newTheme: 'dark' | 'light' | 'system') => {
    if (!settings) return;
    setTheme(newTheme);
    
    try {
      const updated = await settingsService.updateSettings({
        appearance: { ...settings.appearance, theme: newTheme }
      });
      setSettings(updated);
      toast.success(`Theme preference updated to ${newTheme}.`);
    } catch {
      toast.error('Failed to save appearance setting.');
    }
  };

  const handleToggleNotification = async (key: keyof UserSettings['notifications']) => {
    if (!settings) return;
    const newNotifications = {
      ...settings.notifications,
      [key]: !settings.notifications[key]
    };

    try {
      const updated = await settingsService.updateSettings({ notifications: newNotifications });
      setSettings(updated);
      toast.success('Notification settings saved.');
    } catch {
      toast.error('Failed to update notifications preferences.');
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-light-text-muted">
        <p className="text-sm">Platform settings details could not be retrieved.</p>
      </div>
    );
  }

  return (
    <main className="space-y-6 px-4 py-6 max-w-3xl mx-auto">
      <PageHeader
        title="Platform Configuration"
        subtitle="Manage platform alerts, dashboard displays, and security defaults."
      />

      {/* Appearance Settings */}
      <section className="p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
          <Eye className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
          Appearance Settings
        </h3>

        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted block">Theme Mode</span>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleAppearanceTheme(mode)}
                className={`py-3 px-4 text-xs font-bold rounded border uppercase tracking-wider text-center transition-all ${
                  settings.appearance.theme === mode
                    ? 'border-primary-blue dark:border-primary-sky bg-primary-blue/5 dark:bg-primary-sky/5 text-primary-blue dark:text-primary-sky'
                    : 'border-gray-200 dark:border-gray-800 text-light-text-muted hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
          <Bell className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
          Notification Preferences
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-850">
            <div>
              <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">Email Notifications</h4>
              <p className="text-[10px] text-light-text-muted mt-0.5">Receive daily security updates via email.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={() => handleToggleNotification('email')}
              className="h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-850">
            <div>
              <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">Desktop Notifications</h4>
              <p className="text-[10px] text-light-text-muted mt-0.5">Allow web browser to trigger banner popups on high alerts.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.desktop}
              onChange={() => handleToggleNotification('desktop')}
              className="h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-850">
            <div>
              <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">AI Task Alerting</h4>
              <p className="text-[10px] text-light-text-muted mt-0.5">Notify in-app when custom prompt tasks conclude generation.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.aiCompletion}
              onChange={() => handleToggleNotification('aiCompletion')}
              className="h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue"
            />
          </div>
        </div>
      </section>

      {/* Security Preferences */}
      <section className="p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
          <Shield className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
          Security Credentials
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">Two-Factor Authentication</h4>
              <p className="text-[10px] text-light-text-muted mt-0.5">Enforce one-time authorization tokens during analyst sign in.</p>
            </div>
            <span className="inline-flex text-[9px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 border rounded px-1.5 py-0.5 text-light-text-muted">
              Disabled
            </span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg-secondary text-light-text-muted cursor-not-allowed opacity-60"
            >
              <Key className="h-4 w-4" />
              Reset Password Credentials (Disabled)
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
export default SettingsPage;
