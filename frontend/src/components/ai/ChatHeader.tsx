import React from 'react';
import { Bot, Download, Trash2, Settings, PanelLeft, Wifi, WifiOff } from 'lucide-react';
import type { AIConversation } from '../../types/ai.types';
import { aiService } from '../../services/ai.service';

interface ChatHeaderProps {
  conversation?: AIConversation | null;
  isGenerating?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onClear?: () => void;
  onExport?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation, isGenerating = false, sidebarOpen = true,
  onToggleSidebar, onClear, onExport,
}) => {
  const handleExport = async () => {
    if (!conversation) return;
    const md = await aiService.exportConversation(conversation);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${conversation.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (onExport) onExport();
  };

  return (
    <header
      className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-small"
      role="banner"
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="flex items-center justify-center h-8 w-8 rounded-button border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors"
        aria-label={sidebarOpen ? 'Close conversation sidebar' : 'Open conversation sidebar'}
        aria-pressed={sidebarOpen}
      >
        <PanelLeft className="h-4 w-4 text-light-text-muted" aria-hidden="true" />
      </button>

      {/* AI avatar */}
      <div
        className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky dark:from-primary-sky dark:to-blue-400 text-white shadow-small shrink-0"
        aria-hidden="true"
      >
        <Bot className="h-5 w-5" />
      </div>

      {/* Title area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-sm font-black text-light-text-primary dark:text-dark-text-primary truncate">
            {conversation?.title ?? 'AI Analyst Assistant'}
          </h1>

          {/* Model badge */}
          <span className="inline-flex items-center rounded-badge border border-primary-blue/20 dark:border-primary-sky/20 bg-primary-blue/5 dark:bg-primary-sky/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary-blue dark:text-primary-sky">
            Gemini 1.5 Pro
          </span>

          {/* Status */}
          <span
            className={`inline-flex items-center gap-1 rounded-badge border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
              isGenerating
                ? 'border-severity-medium/30 bg-severity-medium/10 text-severity-medium'
                : 'border-positive/30 bg-positive-bg text-positive'
            }`}
            role="status"
            aria-live="polite"
            aria-label={isGenerating ? 'AI is generating' : 'AI service connected'}
          >
            {isGenerating
              ? <><WifiOff className="h-2.5 w-2.5" aria-hidden="true" /> Generating…</>
              : <><Wifi className="h-2.5 w-2.5" aria-hidden="true" /> Connected</>
            }
          </span>
        </div>

        <p className="text-[10px] text-light-text-muted hidden sm:block">
          Enterprise Threat Intelligence · SOC AI Assistant · Powered by simulated RAG
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleExport}
          disabled={!conversation || conversation.messageCount === 0}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-button border border-gray-200 dark:border-gray-700 text-[10px] font-bold text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Export conversation as Markdown"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onClear}
          disabled={!conversation || conversation.messageCount === 0}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-button border border-gray-200 dark:border-gray-700 text-[10px] font-bold text-light-text-muted hover:text-severity-critical hover:border-severity-critical/30 hover:bg-severity-critical/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Clear conversation"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <button
          disabled
          className="inline-flex items-center justify-center h-8 w-8 rounded-button border border-gray-200 dark:border-gray-700 text-light-text-muted opacity-40 cursor-not-allowed"
          title="Settings — Phase 9"
          aria-label="Chat settings (coming in Phase 9)"
          tabIndex={-1}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
