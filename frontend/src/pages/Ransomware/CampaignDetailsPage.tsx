import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Lock, Building2, Globe, ShieldCheck, AlertTriangle, FileText,
} from 'lucide-react';
import { intelService } from '../../services/intel.service';
import type { RansomwareCampaign } from '../../types/intel.types';
import { CampaignDetailsSkeleton } from '../../components/intel/IntelSkeletons';

interface FieldRowProps { label: string; value: React.ReactNode; }
const FieldRow: React.FC<FieldRowProps> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2.5 border-b border-gray-100 dark:border-gray-800/50 last:border-0">
    <span className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted sm:w-44 shrink-0">{label}</span>
    <span className="text-sm text-light-text-primary dark:text-dark-text-primary">{value}</span>
  </div>
);

interface ChipListProps { items: string[]; variant: 'red' | 'blue' | 'gray'; }
const ChipList: React.FC<ChipListProps> = ({ items, variant }) => {
  const cls = {
    red:  'border-severity-critical/20 bg-severity-critical/5 text-severity-critical',
    blue: 'border-primary-blue/20 dark:border-primary-sky/20 bg-primary-blue/5 dark:bg-primary-sky/5 text-primary-blue dark:text-primary-sky',
    gray: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg-secondary/30 text-light-text-secondary dark:text-dark-text-secondary',
  }[variant];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cls}`}>{item}</span>
      ))}
    </div>
  );
};

export const CampaignDetailsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<RansomwareCampaign | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await intelService.getCampaignById(campaignId);
      if (!data) setError('Campaign record not found.');
      else setCampaign(data);
    } catch {
      setError('Failed to fetch campaign details.');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto">
      <CampaignDetailsSkeleton />
    </main>
  );

  if (error || !campaign) return (
    <main className="p-4 sm:p-6 max-w-screen-2xl mx-auto">
      <div role="alert" className="rounded-card border border-severity-critical/30 bg-severity-critical/5 px-5 py-4 space-y-3">
        <p className="text-sm font-bold text-severity-critical">{error ?? 'Campaign not found.'}</p>
        <button
          onClick={() => navigate('/ransomware')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-severity-critical hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Ransomware Monitor
        </button>
      </div>
    </main>
  );

  return (
    <main className="space-y-6 p-4 sm:p-6 max-w-screen-2xl mx-auto" aria-label="Ransomware campaign detail view">
      {/* Back */}
      <button
        onClick={() => navigate('/ransomware')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary hover:text-severity-high transition-colors"
        aria-label="Go back to Ransomware Monitor"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Ransomware Monitor
      </button>

      {/* Header */}
      <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small p-5 flex items-start gap-4">
        <div className="flex items-center justify-center h-12 w-12 rounded-card bg-severity-high/10 border border-severity-high/20 shrink-0">
          <Lock className="h-6 w-6 text-severity-high" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black text-light-text-primary dark:text-dark-text-primary">{campaign.name}</h1>
          <p className="text-xs text-light-text-muted mt-0.5">
            Orchestrated by <span className="font-bold text-severity-high">{campaign.threatActor}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-severity-critical/30 bg-severity-critical/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-severity-critical shrink-0">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          {campaign.victimCount} Victims
        </span>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: metadata */}
        <div className="xl:col-span-2 space-y-5">
          {/* Technical metadata */}
          <section className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-muted mb-4 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Campaign Metadata
            </h2>
            <FieldRow label="Campaign Name"  value={campaign.name} />
            <FieldRow label="Threat Actor"   value={campaign.threatActor} />
            <FieldRow label="Victims"        value={campaign.victimCount} />
            <FieldRow label="Industries"     value={<ChipList items={campaign.industries} variant="gray" />} />
            <FieldRow label="Countries"      value={<ChipList items={campaign.countries} variant="gray" />} />
            <FieldRow label="First Seen"     value={new Date(campaign.firstSeen).toLocaleString()} />
            <FieldRow label="Last Seen"      value={new Date(campaign.lastSeen).toLocaleString()} />
            <FieldRow label="Initial Access" value={campaign.initialAccess} />
          </section>

          {/* Mitigation */}
          <section className="rounded-card border border-severity-medium/20 bg-severity-medium/5 p-5 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-severity-medium flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Mitigation Advisory
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{campaign.mitigation}</p>
          </section>
        </div>

        {/* Right: associations */}
        <div className="space-y-4">
          <section className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-muted flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Associated Malware
            </h2>
            <ChipList items={campaign.associatedMalware} variant="red" />
          </section>
          <section className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-muted flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Associated CVEs
            </h2>
            <ChipList items={campaign.associatedCves} variant="blue" />
          </section>
        </div>
      </div>
    </main>
  );
};

export default CampaignDetailsPage;
