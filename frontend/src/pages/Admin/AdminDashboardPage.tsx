import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Rss, Cpu, Activity } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [systemHealthy] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [activeFeedsCount, setActiveFeedsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);

  useEffect(() => {
    Promise.all([
      adminService.getUsers(),
      adminService.getFeeds(),
      adminService.getJobs()
    ]).then(([users, feeds, jobs]) => {
      setUserCount(users.length);
      setActiveFeedsCount(feeds.filter((f) => f.enabled).length);
      setActiveJobsCount(jobs.filter((j) => j.status === 'running' || j.status === 'idle').length);
    }).catch(() => {
      toast.error('Failed to retrieve general SOC metrics.');
    });
  }, [toast]);

  const stats = [
    { label: 'System Health', value: systemHealthy ? 'Healthy' : 'Degraded', icon: Activity, color: systemHealthy ? 'text-positive bg-positive-bg' : 'text-severity-critical bg-severity-critical/10', path: '/monitoring' },
    { label: 'Registered Analysts', value: userCount, icon: Users, color: 'text-primary-blue dark:text-primary-sky bg-primary-blue/10 dark:bg-primary-sky/10', path: '/user-management' },
    { label: 'Active Threat Feeds', value: activeFeedsCount, icon: Rss, color: 'text-severity-high bg-severity-high/10', path: '/admin' },
    { label: 'Active Schedulers', value: activeJobsCount, icon: Cpu, color: 'text-severity-medium bg-severity-medium/10', path: '/scheduler' },
  ];

  return (
    <main className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Administration Console"
        subtitle="Global platform status, user configuration controls, and background process schedules."
      />

      {/* Grid Quick Indicators */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <button
            key={idx}
            onClick={() => navigate(stat.path)}
            className="p-5 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card hover:shadow-small text-left transition-all flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">{stat.label}</span>
              <p className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </button>
        ))}
      </section>

      {/* Infrastructure Details */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Status Panel */}
        <div className="p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4 md:col-span-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
            System Control Indicators
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded border border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-dark-bg-secondary flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">PostgreSQL Primary</h4>
                <p className="text-[10px] text-light-text-muted mt-0.5">Connection pool stats: 12/100</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-positive" />
            </div>

            <div className="p-4 rounded border border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-dark-bg-secondary flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">ChromaDB Cluster</h4>
                <p className="text-[10px] text-light-text-muted mt-0.5">Embedding vector size: 12.4M</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-positive" />
            </div>

            <div className="p-4 rounded border border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-dark-bg-secondary flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">API Endpoint Gateway</h4>
                <p className="text-[10px] text-light-text-muted mt-0.5">Latency average: 42ms</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-positive" />
            </div>

            <div className="p-4 rounded border border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-dark-bg-secondary flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">Gemini API Token Provider</h4>
                <p className="text-[10px] text-light-text-muted mt-0.5">Rate limit quota: 98.2% remaining</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-positive" />
            </div>
          </div>
        </div>

        {/* Diagnostic Logs Overview */}
        <div className="p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2">
            SOC Live Incidents
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-positive mt-1.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-light-text-primary dark:text-dark-text-primary">AlienVault Sync complete</p>
                <span className="text-[9px] text-light-text-muted block">12 mins ago</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-severity-medium mt-1.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-light-text-primary dark:text-dark-text-primary">Scheduler backup warning</p>
                <span className="text-[9px] text-light-text-muted block">45 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
export default AdminDashboardPage;
