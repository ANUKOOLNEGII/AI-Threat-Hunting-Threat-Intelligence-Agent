import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck, Terminal, Award, Share2, Info, Copy, Network, Heart } from 'lucide-react';
import { iocService } from '../../services/ioc.service';
import type { IOCItem } from '../../types/ioc.types';
import { ReputationBadge } from '../../components/ioc/ReputationBadge';
import { IOCTimeline } from '../../components/ioc/IOCTimeline';
import { IOCRelationshipPanel } from '../../components/ioc/IOCRelationshipPanel';
import { WHOISPanel } from '../../components/ioc/WHOISPanel';
import { ThreatIntelSourcesPanel } from '../../components/ioc/ThreatIntelSourcesPanel';
import { IOCDetailsSkeleton } from '../../components/ioc/IOCSkeletons';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

export const IOCDetailsPage: React.FC = () => {
  const { iocId } = useParams<{ iocId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [ioc, setIoc] = useState<IOCItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'relations' | 'whois' | 'intel'>('details');

  const fetchIoc = useCallback(async () => {
    if (!iocId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await iocService.getIocById(iocId);
      if (!data) {
        setError('Indicator not found in active telemetry datastore.');
      } else {
        setCoc(data);
      }
    } catch {
      setError('An error occurred while connecting to threat feeds.');
    } finally {
      setLoading(false);
    }
  }, [iocId]);

  function setCoc(data: IOCItem) {
    setIoc(data);
  }

  useEffect(() => {
    fetchIoc();
  }, [fetchIoc]);

  const handleCopyValue = () => {
    if (!ioc) return;
    navigator.clipboard.writeText(ioc.value).then(() => {
      toast.success('Indicator value copied to clipboard.');
    });
  };

  if (loading) return <IOCDetailsSkeleton />;

  if (error || !ioc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldCheck className="h-12 w-12 text-severity-critical mb-4" />
        <h2 className="text-sm font-bold text-severity-critical mb-2">{error ?? 'Indicator Not Found'}</h2>
        <Button variant="primary" size="sm" onClick={() => navigate('/ioc-explorer')}>
          Return to IOC Explorer
        </Button>
      </div>
    );
  }

  const TABS = [
    { id: 'details', label: 'Indicator Details', icon: Info },
    { id: 'timeline', label: 'Activity Logs', icon: Terminal },
    { id: 'relations', label: 'Semantic Mappings', icon: Network },
    { id: 'whois', label: 'WHOIS Registry', icon: ExternalLink },
    { id: 'intel', label: 'Threat Feeds Reputation', icon: Award },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Navigation header row */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/ioc-explorer')}
          className="gap-1.5 -ml-1 text-light-text-muted hover:text-light-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          IOC Explorer
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyValue} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Value</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Indicator share link copied to clipboard.')}
            className="gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Indicator watchmarked to alerts.')}
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
            {ioc.type.toUpperCase()}
          </span>
          <ReputationBadge reputation={ioc.reputation} />
          <span className="inline-flex items-center rounded-badge bg-primary-blue/8 dark:bg-primary-sky/8 border border-primary-blue/20 dark:border-primary-sky/20 px-2.5 py-0.5 text-xs font-bold text-primary-blue dark:text-primary-sky">
            Confidence: {ioc.confidence}%
          </span>
        </div>

        <h1 className="text-xl font-extrabold text-light-text-primary dark:text-dark-text-primary leading-snug font-mono break-all">
          {ioc.value}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-light-text-muted dark:text-dark-text-muted">
          <span>Source Feed: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{ioc.source}</strong></span>
          <span>·</span>
          <span>Status: <strong className="text-light-text-secondary dark:text-dark-text-secondary uppercase">{ioc.status}</strong></span>
          <span>·</span>
          <span>First Seen: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{new Date(ioc.firstSeen).toLocaleDateString()}</strong></span>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex flex-wrap gap-1 -mb-px" aria-label="IOC section navigation">
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

      {/* Tab contents */}
      <div className="pt-2">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
                  Threat Triage Assessment
                </h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  {ioc.description || 'No detailed assessment provided for this threat telemetry point.'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
                  Assessment Metadata
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-light-text-muted">Type</span>
                    <span className="font-mono font-semibold uppercase">{ioc.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-light-text-muted">Confidence</span>
                    <span className="font-semibold">{ioc.confidence}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-light-text-muted">Threat Associations</span>
                    <span className="font-semibold">{ioc.threatCount} mapped</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && <IOCTimeline events={ioc.timeline} />}
        {activeTab === 'relations' && <IOCRelationshipPanel relationships={ioc.relationships} />}
        {activeTab === 'whois' && <WHOISPanel whois={ioc.whois} />}
        {activeTab === 'intel' && <ThreatIntelSourcesPanel intel={ioc.externalIntel} />}
      </div>
    </div>
  );
};

export default IOCDetailsPage;
