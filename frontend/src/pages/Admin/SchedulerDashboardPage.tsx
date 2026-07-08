import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Cpu, Clock } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { ScheduledJob } from '../../types/admin.types';
import { TableSkeleton } from '../../components/admin/AdminSkeletons';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

export const SchedulerDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getJobs().then((data) => {
      setJobs(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load scheduler process database.');
      setLoading(false);
    });
  }, [toast]);

  const handleAction = async (id: string, action: 'pause' | 'resume' | 'retry') => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    let targetStatus: ScheduledJob['status'] = 'idle';
    if (action === 'resume') targetStatus = 'running';
    if (action === 'pause') targetStatus = 'idle';
    if (action === 'retry') targetStatus = 'running';

    try {
      const updated = await adminService.updateJobStatus(id, targetStatus);
      setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
      toast.success(`Job action "${action}" completed.`);
    } catch {
      toast.error('Failed to update job status.');
    }
  };

  return (
    <main className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Background Schedulers"
        subtitle="Manage automated ingestion synchronization, index maintenance, and audit clean tasks."
      />

      {/* Grid status cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Running Jobs</span>
            <p className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">
              {jobs.filter((j) => j.status === 'running').length}
            </p>
          </div>
          <div className="p-3 rounded-full bg-positive-bg text-positive">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Idle Jobs</span>
            <p className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">
              {jobs.filter((j) => j.status === 'idle').length}
            </p>
          </div>
          <div className="p-3 rounded-full bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">Failed History</span>
            <p className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">
              {jobs.filter((j) => j.status === 'failed').length}
            </p>
          </div>
          <div className="p-3 rounded-full bg-severity-critical/10 text-severity-critical">
            <RotateCcw className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Scheduler Data Table */}
      <section>
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-card overflow-hidden bg-white dark:bg-dark-bg-card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800" aria-label="Scheduled task list">
                <thead className="bg-gray-50 dark:bg-dark-bg-secondary text-[10px] font-black uppercase tracking-wider text-light-text-muted text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">Scheduler Name</th>
                    <th scope="col" className="px-4 py-3.5">Interval Cron</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-4 py-3.5">Last Sync</th>
                    <th scope="col" className="px-4 py-3.5">Next Planned Run</th>
                    <th scope="col" className="px-4 py-3.5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-xs text-light-text-primary dark:text-dark-text-primary">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover">
                      <td className="px-4 py-3.5 font-bold">
                        {job.name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs">
                        {job.schedule}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          job.status === 'running'
                            ? 'bg-positive-bg text-positive border-positive/30'
                            : job.status === 'failed'
                              ? 'bg-severity-critical/10 text-severity-critical border-severity-critical/30'
                              : 'bg-gray-100 dark:bg-gray-800 text-light-text-muted border-gray-200 dark:border-gray-700'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-light-text-muted text-[10px]">
                        {new Date(job.lastRun).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-light-text-muted text-[10px]">
                        {new Date(job.nextRun).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 shrink-0">
                        {job.status === 'running' ? (
                          <button
                            onClick={() => handleAction(job.id, 'pause')}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-severity-medium"
                            title="Pause task schedule"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(job.id, 'resume')}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-positive"
                            title="Resume run scheduler"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleAction(job.id, 'retry')}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary"
                          title="Trigger instant manual retry"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
export default SchedulerDashboardPage;
