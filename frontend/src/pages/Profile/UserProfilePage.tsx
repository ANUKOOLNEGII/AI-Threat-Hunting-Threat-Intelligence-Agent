import React, { useEffect, useState } from 'react';
import { User, Shield, Mail, Activity } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import type { UserProfile } from '../../types/settings.types';
import { ProfileSkeleton } from '../../components/settings/SettingsSkeletons';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

export const UserProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /* Edit fields state */
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getProfile().then((data) => {
      setProfile(data);
      setName(data.name);
      setRole(data.role);
      setOrganization(data.organization);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load user profile metrics.');
      setLoading(false);
    });
  }, [toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      const updated = await settingsService.updateProfile({ name, role, organization });
      setProfile(updated);
      setEditMode(false);
      toast.success('Analyst profile credentials updated.');
    } catch {
      toast.error('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-light-text-muted">
        <p className="text-sm">UserProfile could not be pulled from core authentication servers.</p>
      </div>
    );
  }

  return (
    <main className="space-y-6 px-4 py-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Analyst Profile"
        subtitle="Manage personal directory settings, key logs, and command access levels."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Left panel */}
        <section className="lg:col-span-1 p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky flex items-center justify-center border border-primary-blue/20 dark:border-primary-sky/20">
            <User className="h-10 w-10" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-black text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide">
              {profile.name}
            </h3>
            <p className="text-[11px] text-light-text-muted">{profile.role}</p>
          </div>

          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider rounded-badge px-2.5 py-0.5 border border-positive/30 bg-positive-bg text-positive">
            {profile.status}
          </span>

          <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-800/60 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-4 w-4 text-light-text-muted shrink-0" />
              <span className="text-light-text-secondary dark:text-dark-text-secondary truncate">
                L3 Security Clearance
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-4 w-4 text-light-text-muted shrink-0" />
              <span className="text-light-text-secondary dark:text-dark-text-secondary truncate">
                {profile.email}
              </span>
            </div>
          </div>
        </section>

        {/* Details & Edit form Right panel */}
        <section className="lg:col-span-2 p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card">
          {!editMode ? (
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2">
                Analyst Specifications
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-light-text-muted block">Full Name</span>
                  <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">{profile.name}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-light-text-muted block">Organization Unit</span>
                  <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">{profile.organization}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-light-text-muted block">System Role</span>
                  <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">{profile.role}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-light-text-muted block">Last Access Stamp</span>
                  <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">
                    {new Date(profile.lastLogin).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Activity numbers */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-light-text-muted flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary-blue dark:text-primary-sky" />
                  Operational Telemetry Metrics
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded bg-gray-50 dark:bg-dark-bg-secondary border border-gray-100 dark:border-gray-850 text-center">
                    <span className="text-lg font-black text-primary-blue dark:text-primary-sky">{profile.activitySummary.queriesRun}</span>
                    <p className="text-[9px] font-bold text-light-text-muted uppercase tracking-wider mt-1">Queries Run</p>
                  </div>
                  <div className="p-3 rounded bg-gray-50 dark:bg-dark-bg-secondary border border-gray-100 dark:border-gray-850 text-center">
                    <span className="text-lg font-black text-severity-high">{profile.activitySummary.reportsGenerated}</span>
                    <p className="text-[9px] font-bold text-light-text-muted uppercase tracking-wider mt-1">Reports Ready</p>
                  </div>
                  <div className="p-3 rounded bg-gray-50 dark:bg-dark-bg-secondary border border-gray-100 dark:border-gray-850 text-center">
                    <span className="text-lg font-black text-positive">{profile.activitySummary.alertsResolved}</span>
                    <p className="text-[9px] font-bold text-light-text-muted uppercase tracking-wider mt-1">Alerts Resolved</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800/60">
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 text-xs font-bold rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
                >
                  Edit Specifications
                </button>
              </div>
            </div>
          ) : (
            /* Editing State Form */
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2">
                Edit Specifications
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">
                    Full Name
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-org" className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">
                    Organization Unit
                  </label>
                  <input
                    id="edit-org"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-role" className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">
                    System Role
                  </label>
                  <input
                    id="edit-role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800/60">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 text-xs font-bold rounded-button border border-gray-250 dark:border-gray-700 text-light-text-primary dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};
export default UserProfilePage;
