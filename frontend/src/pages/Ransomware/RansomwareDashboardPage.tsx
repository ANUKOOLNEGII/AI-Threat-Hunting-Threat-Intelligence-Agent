import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, ShieldAlert, Building2, Globe, ChevronRight,
  RefreshCw, AlertTriangle, Calendar,
} from 'lucide-react';
import { intelService } from '../../services/intel.service';
import type { RansomwareCampaign } from '../../types/intel.types';
import { RansomwareListSkeleton } from '../../components/intel/IntelSkeletons';

/* ---------- stat card ---------- */
interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  accent: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, accent }) => (
  <div className={`rounded-card border p-4 flex items-center gap-3 ${accent}`}>
    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  </div>
);

/* ---------- campaign card ---------- */
const CampaignCard: React.FC<{ campaign: RansomwareCampaign }> = ({ campaign }) => (
  <article className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small hover:shadow-medium transition-shadow">
    <Link to={`/ransomware/${campaign.id}`} className="block p-5 space-y-4 group" aria-label={`View campaign ${campaign.name}`}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-light-text-primary dark:text-dark-text-primary group-hover:text-severity-high transition-colors truncate">
            {campaign.name}
          </h3>
          <p className="text-[11px] text-light-text-muted mt-0.5">
            Operated by <span className="font-bold text-severity-high">{campaign.threatActor}</span>
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-light-text-muted group-hover:text-severity-high shrink-0 transition-colors mt-0.5" aria-hidden="true" />
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-severity-critical">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          {campaign.victimCount} victims
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-light-text-muted">
          <Building2 className="h-3 w-3" aria-hidden="true" />
          {campaign.industries.join(' · ')}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-light-text-muted">
          <Globe className="h-3 w-3" aria-hidden="true" />
          {campaign.countries.join(' · ')}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-light-text-muted">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          {new Date(campaign.firstSeen).toLocaleDateString()} – {new Date(campaign.lastSeen).toLocaleDateString()}
        </span>
      </div>

      {/* Access vector */}
      <div className="rounded-input border border-severity-high/15 bg-severity-high/5 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-severity-high mb-0.5">Initial Access Vector</p>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{campaign.initialAccess}</p>
      </div>

      {/* Associated malware/CVEs chips */}
      <div className="flex flex-wrap gap-1.5">
        {campaign.associatedMalware.map((m) => (
          <span key={m} className="text-[10px] font-bold px-2 py-0.5 rounded border border-severity-critical/20 bg-severity-critical/5 text-severity-critical">
            {m}
          </span>
        ))}
        {campaign.associatedCves.map((c) => (
          <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded border border-primary-blue/20 dark:border-primary-sky/20 bg-primary-blue/5 dark:bg-primary-sky/5 text-primary-blue dark:text-primary-sky">
            {c}
          </span>
        ))}
      </div>
    </Link>
  </article>
);

/* ========== PAGE ========== */

export const RansomwareDashboardPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<RansomwareCampaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await intelService.getRansomware();
      setCampaigns(data);
    } catch {
      setError('Failed to load ransomware campaign data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalVictims = campaigns.reduce((s, c) => s + c.victimCount, 0);

  return (
    <main className="space-y-6 p-4 sm:p-6 max-w-screen-2xl mx-auto" aria-label="Ransomware Campaign Monitor">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-card bg-severity-high/10 border border-severity-high/20 shrink-0">
            <Lock className="h-5 w-5 text-severity-high" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-black text-light-text-primary dark:text-dark-text-primary">
              Ransomware Campaign Monitor
            </h1>
            <p className="text-xs text-light-text-muted">
              Active campaigns · Victim tracking · Mitigation advisories
            </p>
          </div>
        </div>
        <button
          onClick={load}
          aria-label="Refresh ransomware campaigns"
          className="sm:ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card hover:bg-gray-50 dark:hover:bg-dark-bg-hover transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </header>

      {/* Stats */}
      <section aria-label="Ransomware statistics" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Lock}          label="Active Campaigns" value={campaigns.length}  accent="border-severity-high/20 bg-severity-high/5 text-severity-high shadow-small" />
        <StatCard icon={AlertTriangle} label="Total Victims"    value={totalVictims}      accent="border-severity-critical/20 bg-severity-critical/5 text-severity-critical shadow-small" />
        <StatCard icon={ShieldAlert}   label="CVEs Exploited"   value={campaigns.flatMap((c) => c.associatedCves).length} accent="border-primary-blue/20 dark:border-primary-sky/20 bg-primary-blue/5 dark:bg-primary-sky/5 text-primary-blue dark:text-primary-sky shadow-small" />
      </section>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-card border border-severity-critical/30 bg-severity-critical/5 px-4 py-3 text-sm text-severity-critical flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Campaign cards */}
      <section aria-label="Campaign list">
        {loading ? (
          <RansomwareListSkeleton />
        ) : campaigns.length === 0 ? (
          <p className="p-10 text-center text-sm text-light-text-muted">No active ransomware campaigns found.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        )}
      </section>
    </main>
  );
};

export default RansomwareDashboardPage;
