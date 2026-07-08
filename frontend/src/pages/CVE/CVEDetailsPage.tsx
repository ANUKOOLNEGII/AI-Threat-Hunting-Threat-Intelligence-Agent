import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck, Terminal, Heart, Share2, Award, Info, Copy } from 'lucide-react';
import { cveService } from '../../services/cve.service';
import type { CVEItem } from '../../types/cve.types';
import { CVSSBadge } from '../../components/cve/CVSSBadge';
import { DetectionRulesPanel } from '../../components/cve/DetectionRulesPanel';
import { MitigationPanel } from '../../components/cve/MitigationPanel';
import { MitreAttackMappingPanel } from '../../components/cve/MitreAttackMapping';
import { CVEDetailsSkeleton } from '../../components/cve/CVESkeletons';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

export const CVEDetailsPage: React.FC = () => {
  const { cveId } = useParams<{ cveId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cve, setCve] = useState<CVEItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'detection' | 'mitigation' | 'mitre' | 'references'>('details');

  const fetchCve = useCallback(async () => {
    if (!cveId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cveService.getCveById(cveId);
      if (!data) {
        setError('CVE record not found in vulnerability datastore.');
      } else {
        setCve(data);
      }
    } catch {
      setError('An error occurred while loading CVE parameters.');
    } finally {
      setLoading(false);
    }
  }, [cveId]);

  useEffect(() => {
    fetchCve();
  }, [fetchCve]);

  const handleCopyId = () => {
    if (!cveId) return;
    navigator.clipboard.writeText(cveId).then(() => {
      toast.success(`${cveId} copied to clipboard.`);
    });
  };

  if (loading) return <CVEDetailsSkeleton />;

  if (error || !cve) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldCheck className="h-12 w-12 text-severity-critical mb-4" />
        <h2 className="text-sm font-bold text-severity-critical mb-2">{error ?? 'Vulnerability Not Found'}</h2>
        <Button variant="primary" size="sm" onClick={() => navigate('/cve-explorer')}>
          Return to CVE Explorer
        </Button>
      </div>
    );
  }

  const TABS = [
    { id: 'details', label: 'Technical Details', icon: Info },
    { id: 'detection', label: 'Detection Rules', icon: Terminal },
    { id: 'mitigation', label: 'Mitigations & Patches', icon: ShieldCheck },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: Award },
    { id: 'references', label: 'References', icon: ExternalLink },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Back CTA */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/cve-explorer')}
          className="gap-1.5 -ml-1 text-light-text-muted hover:text-light-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          CVE Explorer
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyId} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            <span>Copy CVE ID</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Share URL copied to clipboard.')}
            className="gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Vulnerability watchmarked.')}
            className="gap-1.5"
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Bookmark</span>
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold font-mono tracking-wider bg-gray-100 dark:bg-gray-800 text-light-text-primary dark:text-dark-text-primary px-2.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
            {cve.cveId}
          </span>
          <CVSSBadge score={cve.cvssScore} severity={cve.severity} />
          {cve.isExploited && (
            <span className="inline-flex items-center rounded-badge bg-severity-critical/12 text-severity-critical border border-severity-critical/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Known Exploited (KEV)
            </span>
          )}
        </div>

        <h1 className="text-xl font-extrabold text-light-text-primary dark:text-dark-text-primary leading-snug">
          {cve.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-light-text-muted dark:text-dark-text-muted">
          <span>Vendor: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{cve.vendor}</strong></span>
          <span>·</span>
          <span>Product: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{cve.product}</strong></span>
          <span>·</span>
          <span>Published: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{new Date(cve.publishedDate).toLocaleDateString()}</strong></span>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex flex-wrap gap-1 -mb-px" aria-label="CVE section navigation">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary-blue text-primary-blue dark:border-primary-sky dark:text-primary-sky'
                    : 'border-transparent text-light-text-muted hover:text-light-text-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
                  Vulnerability Overview
                </h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  {cve.description}
                </p>
              </div>

              {cve.cvssMetrics && (
                <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
                    CVSS v3 Vector Metrics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-light-text-muted uppercase font-semibold">Access Vector</p>
                      <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{cve.cvssMetrics.accessVector || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-light-text-muted uppercase font-semibold">Complexity</p>
                      <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{cve.cvssMetrics.accessComplexity || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-light-text-muted uppercase font-semibold">Authentication</p>
                      <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{cve.cvssMetrics.authentication || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-light-text-muted uppercase font-semibold">Confidentiality Impact</p>
                      <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{cve.cvssMetrics.confidentialityImpact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-light-text-muted uppercase font-semibold">Integrity Impact</p>
                      <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{cve.cvssMetrics.integrityImpact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-light-text-muted uppercase font-semibold">Availability Impact</p>
                      <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{cve.cvssMetrics.availabilityImpact || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] font-mono text-light-text-muted">
                    Vector String: {cve.cvssMetrics.vectorString}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
                  Vulnerability Metadata
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-light-text-muted">CVE ID</span>
                    <span className="font-mono font-semibold">{cve.cveId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-light-text-muted">Severity</span>
                    <span className="font-semibold uppercase text-severity-critical">{cve.severity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-light-text-muted">Exploited</span>
                    <span className="font-semibold">{cve.isExploited ? 'Yes (KEV)' : 'No'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-light-text-muted">Vendor</span>
                    <span className="font-semibold">{cve.vendor}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-light-text-muted">Product</span>
                    <span className="font-semibold">{cve.product}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detection' && <DetectionRulesPanel rules={cve.detectionRules} />}
        {activeTab === 'mitigation' && <MitigationPanel mitigation={cve.mitigation} />}
        {activeTab === 'mitre' && <MitreAttackMappingPanel mapping={cve.mitreAttack} />}

        {activeTab === 'references' && (
          <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary mb-2">
              External Vulnerability Advisories
            </h3>
            {cve.references && cve.references.length > 0 ? (
              <ul className="space-y-2.5">
                {cve.references.map((ref, idx) => (
                  <li key={idx}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary-blue dark:text-primary-sky hover:underline break-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span>[{ref.source}] {ref.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-light-text-muted">No external reference logs mapped.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CVEDetailsPage;
