import React, { useEffect, useState } from 'react';
import { Activity, Server, Clock, Database, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/ui/States';
import { MonitoringSkeleton } from '../../components/admin/AdminSkeletons';

export const SystemMonitoringPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return <MonitoringSkeleton />;
  }

  return (
    <main className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="System Telemetry Monitoring"
        subtitle="Real-time resource usage, API endpoint latencies, and database statuses."
      />

      {/* Metrics Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">CPU Usage</span>
            <p className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">14.2%</p>
          </div>
          <div className="p-3 rounded-full bg-positive-bg text-positive">
            <Server className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Memory Allocated</span>
            <p className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">3.2 GB / 8 GB</p>
          </div>
          <div className="p-3 rounded-full bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">API Latency</span>
            <p className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">42 ms</p>
          </div>
          <div className="p-3 rounded-full bg-severity-info/10 text-severity-info">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Requests / min</span>
            <p className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">384 RPM</p>
          </div>
          <div className="p-3 rounded-full bg-severity-medium/10 text-severity-medium">
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Visual Chart Placeholders */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2">
            CPU & Memory Utilization History
          </h3>
          <div className="h-56 rounded bg-gray-50 dark:bg-dark-bg-secondary flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 dark:border-gray-850 text-center">
            <span className="text-xs font-bold text-light-text-muted">Utilization Chart Area</span>
            <p className="text-[10px] text-light-text-muted mt-1">Real-time memory allocations mapped (10s intervals)</p>
          </div>
        </div>

        <div className="p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2">
            Database Status Registers
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-850">
              <div className="flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-light-text-muted" />
                <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">PostgreSQL Primary</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-positive-bg text-positive px-2 py-0.5 rounded border border-positive/20">Online</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-850">
              <div className="flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-light-text-muted" />
                <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">MongoDB Data Store</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-positive-bg text-positive px-2 py-0.5 rounded border border-positive/20">Online</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-850">
              <div className="flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-light-text-muted" />
                <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">Redis Cache Node</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-positive-bg text-positive px-2 py-0.5 rounded border border-positive/20">Online</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-850">
              <div className="flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-light-text-muted" />
                <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">Chroma Vector DB</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-positive-bg text-positive px-2 py-0.5 rounded border border-positive/20">Online</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
export default SystemMonitoringPage;
