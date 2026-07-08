import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Shield,
  Brain,
  Link2,
  BookOpen,
} from 'lucide-react';
import { threatsService } from '../../services/threats.service';
import type { ThreatItem } from '../../types/threat.types';
import { ThreatSeverityBadge } from '../../components/threats/ThreatSeverityBadge';
import { ThreatStatusBadge } from '../../components/threats/ThreatStatusBadge';
import { ThreatTimeline } from '../../components/threats/ThreatTimeline';
import { ThreatMetadata } from '../../components/threats/ThreatMetadata';
import { ThreatInvestigationPanel } from '../../components/threats/ThreatInvestigationPanel';
import { ThreatActionsPanel } from '../../components/threats/ThreatActionsPanel';
import { ThreatDetailsSkeleton } from '../../components/threats/ThreatSkeletons';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

/* ── Section card wrapper ───────────────────────────────── */
const Section: React.FC<{
  title: string;
  icon: React.FC<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon: Icon, children, className = '' }) => (
  <section
    className={`rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small overflow-hidden ${className}`}
    aria-labelledby={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
  >
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/30">
      <Icon className="h-4 w-4 text-primary-blue dark:text-primary-sky" aria-hidden="true" />
      <h2
        id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary"
      >
        {title}
      </h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

/* ── IOC Reference table ─────────────────────────────────── */
const IOCTable: React.FC<{ iocs: ThreatItem['iocRefs'] }> = ({ iocs }) => {
  if (!iocs || iocs.length === 0) {
    return (
      <p className="text-xs text-light-text-muted dark:text-dark-text-muted py-4 text-center">
        No IOC references recorded for this threat.
      </p>
    );
  }

  const TYPE_LABELS: Record<string, string> = {
    ip: 'IP Address',
    domain: 'Domain',
    hash: 'Hash',
    url: 'URL',
    email: 'Email',
  };

  const TYPE_COLORS: Record<string, string> = {
    ip: 'text-severity-critical bg-severity-critical/8 border-severity-critical/15',
    domain: 'text-severity-medium bg-severity-medium/8 border-severity-medium/15',
    hash: 'text-severity-info bg-severity-info/8 border-severity-info/15',
    url: 'text-severity-high bg-severity-high/8 border-severity-high/15',
    email: 'text-severity-low bg-severity-low/8 border-severity-low/15',
  };

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-xs" aria-label="Threat IOC indicators">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted w-28">
              Type
            </th>
            <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted">
              Indicator Value
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {iocs.map((ioc, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="py-2 pr-4">
                <span
                  className={`inline-flex items-center rounded-badge border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    TYPE_COLORS[ioc.type] ?? 'text-gray-500 bg-gray-100 border-gray-200'
                  }`}
                >
                  {TYPE_LABELS[ioc.type] ?? ioc.type}
                </span>
              </td>
              <td className="py-2 font-mono text-light-text-primary dark:text-dark-text-primary break-all">
                {ioc.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── Related threats mini-cards ─────────────────────────── */
const RelatedThreatsSection: React.FC<{ threats: ThreatItem['relatedThreats'] }> = ({
  threats,
}) => {
  if (!threats || threats.length === 0) {
    return (
      <p className="text-xs text-light-text-muted dark:text-dark-text-muted py-4 text-center">
        No related threats identified.
      </p>
    );
  }

  return (
    <div className="space-y-2" role="list" aria-label="Related threats">
      {threats.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between gap-3 rounded-input border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          role="listitem"
        >
          <span className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary line-clamp-1">
            {t.title}
          </span>
          <ThreatSeverityBadge severity={t.severity} size="sm" />
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ThreatDetailsPage
═══════════════════════════════════════════════════════════ */
export const ThreatDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [threat, setThreat] = useState<ThreatItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreat = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await threatsService.getThreatById(id);
      if (!data) {
        setError('Threat record not found.');
        toast.error(`No threat found with ID: ${id}`);
      } else {
        setThreat(data);
      }
    } catch {
      setError('Failed to load threat details.');
      toast.error('Unable to retrieve threat intelligence record.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchThreat();
  }, [fetchThreat]);

  if (loading) return <ThreatDetailsSkeleton />;

  if (error || !threat) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-severity-critical mb-4" aria-hidden="true" />
        <h2 className="text-sm font-bold text-severity-critical mb-1">
          {error ?? 'Threat Not Found'}
        </h2>
        <p className="text-xs text-light-text-muted mb-5 max-w-sm">
          The requested threat intelligence record could not be retrieved.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchThreat} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/threat-feed')} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-6">
      {/* ── Back navigation + breadcrumb ── */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/threat-feed')}
          className="gap-1.5 -ml-1"
          aria-label="Return to threat feed"
        >
          <ArrowLeft className="h-4 w-4" />
          Threat Feed
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => toast.success('URL copied.'));
          }}
          className="gap-1.5 text-light-text-muted"
          aria-label="Copy page link"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Copy Link</span>
        </Button>
      </div>

      {/* ── Threat Header ── */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <ThreatSeverityBadge severity={threat.severity} />
          <ThreatStatusBadge status={threat.status} />
          {threat.cvssScore !== undefined && (
            <span
              className={`inline-flex items-center rounded-badge border px-2 py-0.5 text-[11px] font-bold ${
                threat.cvssScore >= 9
                  ? 'bg-severity-critical/10 text-severity-critical border-severity-critical/25'
                  : threat.cvssScore >= 7
                  ? 'bg-severity-high/10 text-severity-high border-severity-high/25'
                  : 'bg-severity-medium/10 text-severity-medium border-severity-medium/25'
              }`}
              aria-label={`CVSS Score: ${threat.cvssScore}`}
            >
              CVSS {threat.cvssScore.toFixed(1)}
            </span>
          )}
          {threat.aiConfidenceScore !== undefined && (
            <span
              className="inline-flex items-center gap-1 rounded-badge border border-primary-blue/20 dark:border-primary-sky/20 bg-primary-blue/8 dark:bg-primary-sky/8 px-2 py-0.5 text-[11px] font-bold text-primary-blue dark:text-primary-sky"
              aria-label={`AI confidence: ${threat.aiConfidenceScore}%`}
            >
              <Brain className="h-3 w-3" aria-hidden="true" />
              AI {threat.aiConfidenceScore}%
            </span>
          )}
        </div>

        <h1 className="text-xl font-extrabold text-light-text-primary dark:text-dark-text-primary leading-snug">
          {threat.title}
        </h1>

        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed max-w-3xl">
          {threat.summary}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-light-text-muted dark:text-dark-text-muted">
          <span>Source: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{threat.source.name}</strong></span>
          <span>·</span>
          <span>Published: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{formatDate(threat.publishedAt)}</strong></span>
          {threat.updatedAt && (
            <>
              <span>·</span>
              <span>Updated: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{formatDate(threat.updatedAt)}</strong></span>
            </>
          )}
        </div>

        {/* Horizontal quick actions */}
        <div className="pt-1">
          <ThreatActionsPanel
            threatId={threat.id}
            title={threat.title}
            orientation="horizontal"
          />
        </div>
      </header>

      {/* ── Main 2+1 column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          {threat.description && (
            <Section title="Executive Summary" icon={BookOpen}>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed whitespace-pre-line">
                {threat.description}
              </p>
            </Section>
          )}

          {/* Threat Timeline */}
          <Section title="Threat Timeline" icon={Shield}>
            <ThreatTimeline events={threat.timeline ?? []} />
          </Section>

          {/* IOC Indicators */}
          <Section title="Indicators of Compromise (IOCs)" icon={Link2}>
            <IOCTable iocs={threat.iocRefs} />
          </Section>

          {/* Investigation Panel */}
          <Section title="Correlated Intelligence" icon={Brain}>
            <ThreatInvestigationPanel threatId={threat.id} />
          </Section>

          {/* References */}
          {threat.references && threat.references.length > 0 && (
            <Section title="External References" icon={ExternalLink}>
              <ul className="space-y-2" role="list">
                {threat.references.map((ref, idx) => (
                  <li key={idx}>
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary-blue dark:text-primary-sky hover:underline break-all"
                      aria-label={`External reference: ${ref}`}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {ref}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Related Threats */}
          {threat.relatedThreats && (
            <Section title="Related Threats" icon={Shield}>
              <RelatedThreatsSection threats={threat.relatedThreats} />
            </Section>
          )}
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-6">
          {/* Metadata */}
          <Section title="Threat Metadata" icon={Shield}>
            <ThreatMetadata threat={threat} />
          </Section>

          {/* Actions Panel */}
          <Section title="Actions" icon={Shield}>
            <ThreatActionsPanel
              threatId={threat.id}
              title={threat.title}
              orientation="vertical"
            />
          </Section>
        </div>
      </div>
    </div>
  );
};

export default ThreatDetailsPage;
