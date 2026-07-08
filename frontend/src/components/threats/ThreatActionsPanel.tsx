import React, { useCallback } from 'react';
import { Bookmark, Share2, Copy, Download, FileText, Bot } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';

interface ThreatActionsPanelProps {
  threatId: string;
  title: string;
  orientation?: 'vertical' | 'horizontal';
}

export const ThreatActionsPanel: React.FC<ThreatActionsPanelProps> = ({
  threatId,
  title,
  orientation = 'vertical',
}) => {
  const { toast } = useToast();

  const handleBookmark = useCallback(() => {
    toast.success(`"${title}" bookmarked to your watchlist.`);
  }, [toast, title]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/threat-feed/${threatId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Threat URL copied to clipboard.'))
      .catch(() => toast.info(`Share URL: /threat-feed/${threatId}`));
  }, [toast, threatId]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/threat-feed/${threatId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Link copied to clipboard.'))
      .catch(() => toast.error('Clipboard access denied.'));
  }, [toast, threatId]);

  const handleExport = useCallback(() => {
    toast.info('Export functionality — Phase 7 implementation.');
  }, [toast]);

  const handleGenerateReport = useCallback(() => {
    toast.info('Report generation — Phase 7 implementation.');
  }, [toast]);

  const handleAIAnalysis = useCallback(() => {
    toast.info('AI Analysis — Phase 6 implementation.');
  }, [toast]);

  const isHorizontal = orientation === 'horizontal';

  const actions = [
    {
      label: 'Bookmark',
      icon: Bookmark,
      onClick: handleBookmark,
      variant: 'outline' as const,
      className: '',
    },
    {
      label: 'Share',
      icon: Share2,
      onClick: handleShare,
      variant: 'outline' as const,
      className: '',
    },
    {
      label: 'Copy Link',
      icon: Copy,
      onClick: handleCopyLink,
      variant: 'outline' as const,
      className: '',
    },
    {
      label: 'Export',
      icon: Download,
      onClick: handleExport,
      variant: 'outline' as const,
      className: 'text-light-text-muted',
    },
    {
      label: 'Generate Report',
      icon: FileText,
      onClick: handleGenerateReport,
      variant: 'outline' as const,
      className: 'text-severity-info border-severity-info/30 hover:bg-severity-info/10',
    },
    {
      label: 'AI Analysis',
      icon: Bot,
      onClick: handleAIAnalysis,
      variant: 'primary' as const,
      className: '',
    },
  ];

  return (
    <div
      className={`flex gap-2 ${isHorizontal ? 'flex-row flex-wrap' : 'flex-col'}`}
      role="toolbar"
      aria-label="Threat actions"
    >
      {actions.map(({ label, icon: Icon, onClick, variant, className }) => (
        <Button
          key={label}
          variant={variant}
          size="sm"
          onClick={onClick}
          className={`gap-2 ${isHorizontal ? '' : 'w-full justify-start'} ${className}`}
          aria-label={label}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </Button>
      ))}
    </div>
  );
};

export default ThreatActionsPanel;
