import React, { useState, useCallback } from 'react';
import {
  Copy, Check, Download, Bookmark, BookmarkCheck,
  ChevronDown, ChevronUp, Share2, Search,
} from 'lucide-react';
import type { AIMessage } from '../../types/ai.types';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ReferencesPanel } from './ReferencesPanel';

interface AIResponseCardProps {
  message: AIMessage;
  onBookmark?: (messageId: string) => void;
  onContinueInvestigation?: (content: string) => void;
  compact?: boolean;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({
  message, onBookmark, onContinueInvestigation, compact = false,
}) => {
  const [copied, setCopied]     = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showRefs, setShowRefs] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  const handleExport = useCallback(() => {
    const blob = new Blob([message.content], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ai-response-${message.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [message.content, message.id]);

  const hasRefs = (message.references?.length ?? 0) > 0;

  return (
    <article
      className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small overflow-hidden"
      aria-label="AI intelligence response"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-blue/5 to-transparent dark:from-primary-sky/5 border-b border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary-blue dark:text-primary-sky">
            AI Analysis
          </span>
          {message.confidence && (
            <ConfidenceIndicator
              level={message.confidence}
              score={message.confidenceScore}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors"
            aria-label={expanded ? 'Collapse response' : 'Expand response'}
          >
            {expanded
              ? <ChevronUp className="h-3.5 w-3.5 text-light-text-muted" aria-hidden="true" />
              : <ChevronDown className="h-3.5 w-3.5 text-light-text-muted" aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      {/* Card body */}
      {expanded && (
        <div className={compact ? 'px-4 py-3' : 'px-5 py-4'}>
          <MarkdownRenderer content={message.content} />
        </div>
      )}

      {/* References */}
      {expanded && hasRefs && showRefs && (
        <div className="px-5 pb-4">
          <ReferencesPanel references={message.references!} />
        </div>
      )}

      {/* Footer toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800/60 bg-light-bg-secondary/30 dark:bg-dark-bg-secondary/20">
        {/* Left actions */}
        <div className="flex items-center gap-1" role="toolbar" aria-label="Response actions">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-bold text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors"
            aria-label="Copy response"
          >
            {copied ? <Check className="h-3 w-3 text-positive" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-bold text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors"
            aria-label="Export as Markdown"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            Export
          </button>

          {hasRefs && (
            <button
              onClick={() => setShowRefs((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-bold transition-colors ${
                showRefs
                  ? 'text-primary-blue dark:text-primary-sky bg-primary-blue/10 dark:bg-primary-sky/10'
                  : 'text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-hover'
              }`}
              aria-label={`${showRefs ? 'Hide' : 'Show'} intelligence references`}
              aria-expanded={showRefs}
            >
              <Search className="h-3 w-3" aria-hidden="true" />
              Sources ({message.references!.length})
            </button>
          )}

          {onBookmark && (
            <button
              onClick={() => onBookmark(message.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-bold transition-colors ${
                message.isBookmarked
                  ? 'text-severity-medium bg-severity-medium/10'
                  : 'text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-hover'
              }`}
              aria-label={message.isBookmarked ? 'Remove bookmark' : 'Bookmark response'}
              aria-pressed={message.isBookmarked}
            >
              {message.isBookmarked
                ? <BookmarkCheck className="h-3 w-3" aria-hidden="true" />
                : <Bookmark className="h-3 w-3" aria-hidden="true" />
              }
              {message.isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          )}
        </div>

        {/* Right: continue investigation */}
        {onContinueInvestigation && (
          <button
            onClick={() => onContinueInvestigation(message.content)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-[10px] font-bold bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
            aria-label="Continue investigation in new prompt"
          >
            <Share2 className="h-3 w-3" aria-hidden="true" />
            Continue Investigation
          </button>
        )}
      </div>
    </article>
  );
};

export default AIResponseCard;
