import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Globe, Bookmark, Zap, ExternalLink, Tag } from 'lucide-react';
import type { ThreatItem } from '../../types/threat.types';
import { ThreatSeverityBadge } from './ThreatSeverityBadge';
import { ThreatStatusBadge } from './ThreatStatusBadge';

interface ThreatCardProps {
  threat: ThreatItem;
  onBookmark?: (id: string) => void;
  onAnalyze?: (id: string) => void;
  loading?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  vulnerability: 'Vulnerability',
  campaign: 'Campaign',
  malware: 'Malware',
  ransomware: 'Ransomware',
  phishing: 'Phishing',
  'data-breach': 'Data Breach',
  apt: 'APT',
  'zero-day': 'Zero-Day',
  advisory: 'Advisory',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const ThreatCard: React.FC<ThreatCardProps> = memo(
  ({ threat, onBookmark, onAnalyze }) => {
    const navigate = useNavigate();

    const handleViewDetails = useCallback(() => {
      navigate(`/threat-feed/${threat.id}`);
    }, [navigate, threat.id]);

    const handleBookmark = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onBookmark?.(threat.id);
      },
      [onBookmark, threat.id]
    );

    const handleAnalyze = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onAnalyze?.(threat.id);
      },
      [onAnalyze, threat.id]
    );

    const aiScore = threat.aiConfidenceScore;
    const aiColor =
      aiScore === undefined
        ? 'text-gray-400'
        : aiScore >= 90
        ? 'text-severity-low'
        : aiScore >= 70
        ? 'text-severity-medium'
        : 'text-severity-critical';

    return (
      <article
        className="group relative flex flex-col rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small transition-all duration-200 hover:shadow-medium hover:border-primary-blue/30 dark:hover:border-primary-sky/30 cursor-pointer overflow-hidden"
        onClick={handleViewDetails}
        tabIndex={0}
        role="article"
        aria-label={`Threat: ${threat.title}`}
        onKeyDown={(e) => e.key === 'Enter' && handleViewDetails()}
      >
        {/* Top severity accent line */}
        <div
          className={`h-0.5 w-full ${
            threat.severity === 'critical'
              ? 'bg-severity-critical'
              : threat.severity === 'high'
              ? 'bg-severity-high'
              : threat.severity === 'medium'
              ? 'bg-severity-medium'
              : threat.severity === 'low'
              ? 'bg-severity-low'
              : 'bg-severity-info'
          }`}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-3 p-5">
          {/* Header row: badges + actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <ThreatSeverityBadge severity={threat.severity} />
              <ThreatStatusBadge status={threat.status} />
              <span className="inline-flex items-center rounded-badge border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg-primary px-2 py-0.5 text-[10px] font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                {CATEGORY_LABELS[threat.category] ?? threat.category}
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={handleBookmark}
                className="flex h-7 w-7 items-center justify-center rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-muted hover:text-primary-blue dark:hover:text-primary-sky transition-colors"
                aria-label="Bookmark threat"
                title="Bookmark"
              >
                <Bookmark className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleAnalyze}
                className="flex h-7 w-7 items-center justify-center rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-muted hover:text-primary-blue dark:hover:text-primary-sky transition-colors"
                aria-label="Analyze threat"
                title="Analyze"
              >
                <Zap className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleViewDetails}
                className="flex h-7 w-7 items-center justify-center rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-muted hover:text-primary-blue dark:hover:text-primary-sky transition-colors"
                aria-label="View threat details"
                title="View Details"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary leading-snug group-hover:text-primary-blue dark:group-hover:text-primary-sky transition-colors line-clamp-2">
            {threat.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed line-clamp-2">
            {threat.summary}
          </p>

          {/* Tags */}
          {threat.tags && threat.tags.length > 0 && (
            <div className="flex flex-wrap gap-1" aria-label="Threat tags">
              {threat.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-0.5 rounded-badge bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 text-[10px] text-light-text-muted dark:text-dark-text-muted font-medium"
                >
                  <Tag className="h-2.5 w-2.5" aria-hidden="true" />
                  {tag.label}
                </span>
              ))}
              {threat.tags.length > 4 && (
                <span className="text-[10px] text-light-text-muted dark:text-dark-text-muted self-center">
                  +{threat.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer row */}
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-light-text-muted dark:text-dark-text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" aria-hidden="true" />
                {threat.source.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {formatDate(threat.publishedAt)}
              </span>
            </div>
            {aiScore !== undefined && (
              <span className={`font-bold ${aiColor}`} aria-label={`AI confidence: ${aiScore}%`}>
                AI {aiScore}%
              </span>
            )}
          </div>
        </div>
      </article>
    );
  }
);

ThreatCard.displayName = 'ThreatCard';
export default ThreatCard;
