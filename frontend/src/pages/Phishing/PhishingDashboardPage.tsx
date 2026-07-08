import React, { useEffect, useState, useCallback } from 'react';
import {
  Mail, Globe, ShieldAlert, RefreshCw, ExternalLink, AlertTriangle,
  Tag, Calendar, Link as LinkIcon, Paperclip,
} from 'lucide-react';
import { intelService } from '../../services/intel.service';
import type { PhishingDomain, PhishingEmail } from '../../types/intel.types';
import { PhishingListSkeleton } from '../../components/intel/IntelSkeletons';

/* ---------- reputation badge ---------- */
const REP_CLASSES: Record<PhishingDomain['reputation'], string> = {
  malicious:  'border-severity-critical/30 bg-severity-critical/10 text-severity-critical',
  suspicious: 'border-severity-medium/30 bg-severity-medium/10 text-severity-medium',
  unknown:    'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-light-text-muted',
};

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

/* ========== PAGE ========== */

export const PhishingDashboardPage: React.FC = () => {
  const [domains, setDomains]   = useState<PhishingDomain[]>([]);
  const [emails, setEmails]     = useState<PhishingEmail[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'domains' | 'emails'>('domains');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, e] = await Promise.all([
        intelService.getPhishingDomains(),
        intelService.getPhishingEmails(),
      ]);
      setDomains(d);
      setEmails(e);
    } catch {
      setError('Failed to load phishing intelligence data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maliciousDomains = domains.filter((d) => d.reputation === 'malicious');

  return (
    <main className="space-y-6 p-4 sm:p-6 max-w-screen-2xl mx-auto" aria-label="Phishing Intelligence Dashboard">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-card bg-severity-medium/10 border border-severity-medium/20 shrink-0">
            <Mail className="h-5 w-5 text-severity-medium" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-black text-light-text-primary dark:text-dark-text-primary">
              Phishing Kit & Indicator Analyzer
            </h1>
            <p className="text-xs text-light-text-muted">
              Spoof domain detection · Credential harvest kits · Email indicators
            </p>
          </div>
        </div>
        <button
          onClick={load}
          aria-label="Refresh phishing data"
          className="sm:ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card hover:bg-gray-50 dark:hover:bg-dark-bg-hover transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </header>

      {/* Stats */}
      <section aria-label="Phishing statistics" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Globe}         label="Phishing Domains"   value={domains.length}          accent="border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary shadow-small" />
        <StatCard icon={AlertTriangle} label="Malicious Domains"  value={maliciousDomains.length} accent="border-severity-critical/20 bg-severity-critical/5 text-severity-critical shadow-small" />
        <StatCard icon={Mail}          label="Phishing Emails"    value={emails.length}           accent="border-severity-medium/20 bg-severity-medium/5 text-severity-medium shadow-small" />
      </section>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-card border border-severity-critical/30 bg-severity-critical/5 px-4 py-3 text-sm text-severity-critical flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800" role="tablist">
        {(['domains', 'emails'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-severity-medium text-severity-medium'
                : 'border-transparent text-light-text-muted hover:text-light-text-secondary dark:hover:text-dark-text-secondary'
            }`}
          >
            {tab === 'domains' ? `Domains (${domains.length})` : `Emails (${emails.length})`}
          </button>
        ))}
      </div>

      {/* Domains Panel */}
      {activeTab === 'domains' && (
        <section id="panel-domains" role="tabpanel" aria-labelledby="tab-domains">
          {loading ? (
            <PhishingListSkeleton />
          ) : domains.length === 0 ? (
            <p className="p-10 text-center text-sm text-light-text-muted">No phishing domains found.</p>
          ) : (
            <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/30 flex items-center gap-2">
                <Globe className="h-4 w-4 text-severity-medium" aria-hidden="true" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
                  Phishing Domains
                </h2>
              </div>
              <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {domains.map((domain) => (
                  <li key={domain.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-light-text-primary dark:text-dark-text-primary">
                          {domain.domain}
                        </span>
                        <span className={`inline-flex text-[10px] font-black uppercase tracking-wider border rounded px-2 py-0.5 ${REP_CLASSES[domain.reputation]}`}>
                          {domain.reputation}
                        </span>
                      </div>
                      <p className="text-[11px] text-light-text-muted mt-0.5">
                        Registrar: {domain.registrar} · Created: {new Date(domain.creationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(domain.relatedThreats ?? []).map((t) => (
                        <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded border border-severity-high/20 bg-severity-high/5 text-severity-high">
                          {t}
                        </span>
                      ))}
                    </div>
                    <a
                      href={`https://www.virustotal.com/gui/domain/${domain.domain}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-blue dark:text-primary-sky hover:underline shrink-0"
                      aria-label={`Check ${domain.domain} on VirusTotal`}
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      VirusTotal
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Emails Panel */}
      {activeTab === 'emails' && (
        <section id="panel-emails" role="tabpanel" aria-labelledby="tab-emails">
          {loading ? (
            <PhishingListSkeleton />
          ) : emails.length === 0 ? (
            <p className="p-10 text-center text-sm text-light-text-muted">No phishing emails found.</p>
          ) : (
            <div className="space-y-4">
              {emails.map((email) => (
                <article key={email.id} className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small p-5 space-y-4">
                  {/* Subject row */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <Mail className="h-4 w-4 text-severity-medium mt-0.5 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-light-text-primary dark:text-dark-text-primary">{email.subject}</p>
                      <p className="text-[11px] text-light-text-muted font-mono mt-0.5">From: {email.sender}</p>
                    </div>
                    <div className="sm:ml-auto flex flex-wrap gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-severity-medium/20 bg-severity-medium/5 text-severity-medium">
                        {email.campaign}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-light-text-muted">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {new Date(email.receivedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* URLs */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" aria-hidden="true" /> URLs
                      </p>
                      {email.urls.map((u) => (
                        <p key={u} className="text-[11px] font-mono text-severity-critical break-all">{u}</p>
                      ))}
                    </div>

                    {/* Attachments */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted flex items-center gap-1">
                        <Paperclip className="h-3 w-3" aria-hidden="true" /> Attachments
                      </p>
                      {email.attachments.map((a) => (
                        <p key={a} className="text-[11px] font-mono text-severity-high">{a}</p>
                      ))}
                    </div>

                    {/* Indicators */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-light-text-muted flex items-center gap-1">
                        <Tag className="h-3 w-3" aria-hidden="true" /> Indicators
                      </p>
                      {email.indicators.map((ind) => (
                        <span key={ind} className="inline-block text-[10px] font-bold px-2 py-0.5 mr-1 mb-1 rounded border border-severity-critical/20 bg-severity-critical/5 text-severity-critical">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default PhishingDashboardPage;
