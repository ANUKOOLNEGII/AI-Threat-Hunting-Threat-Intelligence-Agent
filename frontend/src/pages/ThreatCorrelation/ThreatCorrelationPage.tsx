import React, { useEffect, useState, useCallback } from 'react';
import { GitBranch, RefreshCw, ShieldAlert } from 'lucide-react';
import { intelService } from '../../services/intel.service';
import type { CorrelationNode, CorrelationLink } from '../../types/intel.types';
import { ThreatCorrelationGraph } from '../../components/intel/ThreatCorrelationGraph';
import { ThreatActorCards } from '../../components/intel/ThreatActorCards';
import { GeographicThreatMap } from '../../components/intel/GeographicThreatMap';
import { CorrelationSkeleton } from '../../components/intel/IntelSkeletons';

export const ThreatCorrelationPage: React.FC = () => {
  const [nodes, setNodes]   = useState<CorrelationNode[]>([]);
  const [links, setLinks]   = useState<CorrelationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await intelService.getCorrelation();
      setNodes(data.nodes);
      setLinks(data.links);
    } catch {
      setError('Failed to load correlation data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="space-y-6 p-4 sm:p-6 max-w-screen-2xl mx-auto" aria-label="Threat Correlation Engine">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-card bg-primary-blue/10 dark:bg-primary-sky/10 border border-primary-blue/20 dark:border-primary-sky/20 shrink-0">
            <GitBranch className="h-5 w-5 text-primary-blue dark:text-primary-sky" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-black text-light-text-primary dark:text-dark-text-primary">
              Threat Graph Correlation
            </h1>
            <p className="text-xs text-light-text-muted">
              Entity relationship mapping · Semantic deduplication · Attack chain reconstruction
            </p>
          </div>
        </div>
        <button
          onClick={load}
          aria-label="Refresh correlation data"
          className="sm:ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card hover:bg-gray-50 dark:hover:bg-dark-bg-hover transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </header>

      {/* Summary chips */}
      <section
        aria-label="Correlation summary"
        className="flex flex-wrap gap-3"
      >
        {[
          { label: 'Total Entities', value: nodes.length, color: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary' },
          { label: 'Relationships', value: links.length, color: 'border-primary-blue/20 dark:border-primary-sky/20 bg-primary-blue/5 dark:bg-primary-sky/5 text-primary-blue dark:text-primary-sky' },
          { label: 'CVE Nodes',     value: nodes.filter((n) => n.type === 'cve').length,     color: 'border-severity-critical/20 bg-severity-critical/5 text-severity-critical' },
          { label: 'Actor Nodes',   value: nodes.filter((n) => n.type === 'actor').length,   color: 'border-severity-medium/20 bg-severity-medium/5 text-severity-medium' },
          { label: 'Malware Nodes', value: nodes.filter((n) => n.type === 'malware').length, color: 'border-severity-high/20 bg-severity-high/5 text-severity-high' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-card border px-4 py-3 shadow-small ${color}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
            <p className="text-2xl font-black leading-tight">{value}</p>
          </div>
        ))}
      </section>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-card border border-severity-critical/30 bg-severity-critical/5 px-4 py-3 text-sm text-severity-critical flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Main graph */}
      {loading ? (
        <CorrelationSkeleton />
      ) : (
        <ThreatCorrelationGraph nodes={nodes} links={links} />
      )}

      {/* Lower row: actor cards + geo map */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6" aria-label="Supporting intelligence">
        <ThreatActorCards actors={[
          { id: 'a1', name: 'LockBit Group', country: 'Russia (attributed)', campaignCount: 12, malwareCount: 4, status: 'active' },
          { id: 'a2', name: 'APT29 / Cozy Bear', country: 'Russia (attributed)', campaignCount: 7, malwareCount: 2, status: 'active' },
          { id: 'a3', name: 'Cl0p Gang', country: 'Ukraine (attributed)', campaignCount: 5, malwareCount: 3, status: 'active' },
        ]} />
        <GeographicThreatMap
          origins={['Russia', 'North Korea', 'China', 'Iran', 'Ukraine']}
          victims={['USA', 'Germany', 'Poland', 'UK', 'Japan']}
        />
      </section>
    </main>
  );
};

export default ThreatCorrelationPage;
