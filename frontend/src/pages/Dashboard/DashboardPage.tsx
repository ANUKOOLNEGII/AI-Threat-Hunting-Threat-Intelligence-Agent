import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Feedback';
import { Widget } from '../../components/dashboard/Widget';
import { StatCard } from '../../components/dashboard/StatCard';
import { GlobalSearch } from '../../components/dashboard/GlobalSearch';
import {
  Activity,
  ShieldAlert,
  Bug,
  Hash,
  FileText,
  Bot,
  RefreshCw,
  Search,
  Server,
  Shield,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Mock data — replace with API calls later
───────────────────────────────────────── */
const FEED_ITEMS = [
  {
    id: 'cve-2026-34567',
    title: 'CVE-2026-34567',
    summary: 'RCE path traversal flaw in AcmeWeb CMS v4.2.',
    severity: 'Critical' as const,
    badgeVariant: 'danger' as const,
  },
  {
    id: 'lockbit-v9',
    title: 'LockBit v9 Loader',
    summary: 'Evasive scheduler-based ransomware variant active in wild.',
    severity: 'High' as const,
    badgeVariant: 'warning' as const,
  },
  {
    id: 'cl0p-exfil',
    title: 'Cl0p Data Exfiltration',
    summary: 'New exfil script targeting financial sector ERP endpoints.',
    severity: 'High' as const,
    badgeVariant: 'warning' as const,
  },
];

const FEED_STATUSES = [
  { name: 'NIST NVD Feed', status: 'Synchronized', statusColor: 'text-severity-low' },
  { name: 'CISA KEV Ingest', status: 'Online', statusColor: 'text-severity-low' },
  { name: 'VirusTotal API', status: 'Rate-Limited', statusColor: 'text-severity-medium' },
  { name: 'Shodan Stream', status: 'Connecting...', statusColor: 'text-gray-400' },
];

const TREND_BARS = [
  { pct: '20%', label: '08:00' },
  { pct: '35%', label: '10:00' },
  { pct: '28%', label: '12:00' },
  { pct: '52%', label: '14:00' },
  { pct: '68%', label: '16:00' },
  { pct: '91%', label: 'Live' },
];

/* ─────────────────────────────────────────
   Dashboard Page
───────────────────────────────────────── */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(() => new Date().toLocaleTimeString());
  const [searchOpen, setSearchOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    toast.info('Synchronizing active threat intelligence partitions…');
    setTimeout(() => {
      setLastSync(new Date().toLocaleTimeString());
      setLoading(false);
      toast.success('Sync complete — 14 new indicators ingested.');
    }, 1400);
  }, [toast]);

  const handleQuickAction = useCallback(
    (label: string) => {
      toast.info(`Navigating to: ${label}`);
    },
    [toast]
  );

  return (
    <div className="space-y-6">
      {/* ── 1. Cockpit Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl font-sans text-light-text-primary dark:text-dark-text-primary">
            Welcome back, {user?.name ?? 'Security Operator'}
          </h1>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1 flex flex-wrap items-center gap-2">
            <span>Clearance:</span>
            <Badge variant="primary" aria-label="User role">
              {user?.role ?? 'analyst'}
            </Badge>
            <span>·</span>
            <span>Org: Aegis Systems</span>
            <span>·</span>
            <span>Last sync: {lastSync}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setSearchOpen(true)}
            aria-label="Open global search (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">
              ⌘K
            </kbd>
          </Button>
          <Button
            size="sm"
            loading={loading}
            className="gap-1.5"
            onClick={handleRefresh}
            aria-label="Synchronize feeds"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Feeds
          </Button>
        </div>
      </div>

      {/* ── 2. Statistics Grid ── */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Total Threats Ingested"
            metric="2,481"
            icon={Activity}
            trend="up"
            percentage={12.4}
            loading={loading}
            variant="primary"
          />
          <StatCard
            title="Critical CVEs Flagged"
            metric="41"
            icon={ShieldAlert}
            trend="up"
            percentage={2.1}
            loading={loading}
            variant="danger"
          />
          <StatCard
            title="Active Malware Strains"
            metric="14"
            icon={Bug}
            trend="down"
            percentage={5.3}
            loading={loading}
            variant="warning"
          />
          <StatCard
            title="Correlated IOC Hashes"
            metric="18.9K"
            icon={Hash}
            trend="stable"
            percentage={0}
            loading={loading}
            variant="success"
          />
        </div>
      </section>

      {/* ── 3. Quick Actions Panel ── */}
      <section
        aria-label="Quick actions"
        className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-4 shadow-small"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted mb-3">
          Tactical Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Search Threats', icon: Search, color: 'text-primary-sky' },
            { label: 'Explore CVEs', icon: Shield, color: 'text-primary-blue' },
            { label: 'Investigate IOC', icon: Hash, color: 'text-severity-low' },
            { label: 'AI Analyst', icon: Bot, color: 'text-primary-sky' },
            { label: 'Generate Report', icon: FileText, color: 'text-severity-info' },
            { label: 'Sync Console', icon: RefreshCw, color: 'text-severity-medium' },
          ].map(({ label, icon: Icon, color }) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              className="text-xs justify-start gap-2"
              onClick={() => handleQuickAction(label)}
              aria-label={label}
            >
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>
      </section>

      {/* ── 4. Widget Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

        {/* Threat Trend Chart (spans 2 cols) */}
        <div className="lg:col-span-2">
          <Widget
            title="Threat Ingest Trends"
            description="Vulnerabilities and campaign logs triaged vs time."
            loading={loading}
            onRefresh={handleRefresh}
          >
            <div
              className="h-48 flex items-end justify-between gap-1.5 pt-4"
              role="img"
              aria-label="Threat ingest bar chart"
            >
              {TREND_BARS.map((bar, i) => (
                <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: bar.pct,
                      maxHeight: '100%',
                      backgroundColor:
                        i < 4
                          ? 'rgba(37,99,235,0.35)'
                          : 'rgba(56,189,248,0.55)',
                    }}
                    title={`Ingest at ${bar.label}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
              {TREND_BARS.map((bar) => (
                <span key={bar.label}>{bar.label}</span>
              ))}
            </div>
          </Widget>
        </div>

        {/* Pipeline Feed Status */}
        <Widget
          title="Pipeline Feed Status"
          description="Active ingestion integrations health."
          loading={loading}
        >
          <div className="space-y-3" role="list" aria-label="Feed statuses">
            {FEED_STATUSES.map((feed) => (
              <div
                key={feed.name}
                className="flex justify-between items-center text-xs"
                role="listitem"
              >
                <span className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
                  <Server className="h-4 w-4 text-primary-sky" aria-hidden="true" />
                  {feed.name}
                </span>
                <span className={`font-bold ${feed.statusColor}`}>{feed.status}</span>
              </div>
            ))}
          </div>
        </Widget>

        {/* Real-Time Threat Feed (spans 2 cols) */}
        <div className="lg:col-span-2">
          <Widget
            title="Real-Time Threat Feed"
            description="Triaged CVEs, campaigns, and active indicators."
            loading={loading}
            onRefresh={handleRefresh}
          >
            <div className="divide-y divide-gray-100 dark:divide-gray-800" role="list" aria-label="Threat feed items">
              {FEED_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start gap-4 py-3 text-xs"
                  role="listitem"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-light-text-primary dark:text-dark-text-primary truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">
                      {item.summary}
                    </p>
                  </div>
                  <Badge variant={item.badgeVariant} aria-label={`Severity: ${item.severity}`}>
                    {item.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </Widget>
        </div>

        {/* AI Insights Widget */}
        <Widget
          title="AI Ingestion Insights"
          description="Automated threat correlation summaries."
          loading={loading}
        >
          <div className="space-y-3">
            <div className="p-3 rounded-input bg-primary-blue/5 border border-primary-blue/15 text-[11px] text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              <p className="font-bold mb-1 text-primary-blue dark:text-primary-sky">
                📢 Correlation Alert
              </p>
              <p>
                LockBit v9 campaign identified exploiting CVE-2026-34567 as primary entry vector in
                recent Aerospace sector intrusion.
              </p>
            </div>
            <div className="p-3 rounded-input bg-severity-medium/5 border border-severity-medium/15 text-[11px] text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              <p className="font-bold mb-1 text-severity-medium">⚠ IOC Cluster</p>
              <p>
                14 new SHA-256 hashes correlated to Cl0p exfil toolchain. Recommend immediate IOC
                blocklist update.
              </p>
            </div>
          </div>
        </Widget>
      </div>

      {/* ── Global Search Overlay ── */}
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={(q) => toast.success(`Searching threat index for: "${q}"`)}
      />
    </div>
  );
};

export default DashboardPage;
