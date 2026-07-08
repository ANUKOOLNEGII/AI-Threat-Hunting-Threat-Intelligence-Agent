import React from 'react';
import { User, Bot, AlertTriangle } from 'lucide-react';
import type { AIMessage } from '../../types/ai.types';
import { AITypingIndicator } from './AITypingIndicator';
import { AIResponseCard } from './AIResponseCard';

interface ChatMessageProps {
  message: AIMessage;
  isStreaming?: boolean;
  onBookmark?: (id: string) => void;
  onContinueInvestigation?: (content: string) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message, isStreaming = false, onBookmark, onContinueInvestigation,
}) => {
  /* ---- System message ---- */
  if (message.role === 'system') {
    return (
      <div className="flex justify-center my-3" role="status" aria-live="polite">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-light-text-muted border border-gray-200 dark:border-gray-700 rounded-badge px-3 py-1 bg-light-bg-secondary dark:bg-dark-bg-secondary">
          {message.content}
        </span>
      </div>
    );
  }

  /* ---- Error message ---- */
  if (message.status === 'error') {
    return (
      <div className="flex justify-start my-2" role="alert">
        <div className="flex items-start gap-3 max-w-[90%]">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-severity-critical/10 border border-severity-critical/20 shrink-0">
            <AlertTriangle className="h-4 w-4 text-severity-critical" aria-hidden="true" />
          </div>
          <div className="rounded-card border border-severity-critical/20 bg-severity-critical/5 px-4 py-3 text-sm text-severity-critical">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  /* ---- User message ---- */
  if (message.role === 'user') {
    return (
      <div className="flex justify-end my-3 gap-3" aria-label="Your message">
        <div className="flex flex-col items-end gap-1 max-w-[80%] min-w-0">
          <div className="rounded-card rounded-tr-sm bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary px-4 py-3 text-sm shadow-small">
            <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <time
            className="text-[10px] text-light-text-muted"
            dateTime={message.timestamp}
          >
            {formatTime(message.timestamp)}
          </time>
        </div>
        <div
          className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary shrink-0 font-bold text-xs"
          aria-hidden="true"
        >
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  /* ---- AI message (streaming or complete) ---- */
  if (message.role === 'assistant') {
    return (
      <div className="flex justify-start my-3 gap-3" aria-label="AI assistant response" aria-live="polite">
        {/* Avatar */}
        <div
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky dark:from-primary-sky dark:to-blue-400 text-white shrink-0 shadow-small mt-1"
          aria-hidden="true"
        >
          <Bot className="h-4 w-4" />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Typing state */}
          {isStreaming && message.status === 'streaming' && !message.streamedContent && (
            <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card px-4 py-3 inline-flex">
              <AITypingIndicator />
            </div>
          )}

          {/* Streamed partial content */}
          {isStreaming && message.streamedContent && (
            <div className="rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card px-4 py-3 text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
              {message.streamedContent}
              <span className="inline-block w-0.5 h-4 bg-primary-blue dark:bg-primary-sky ml-0.5 animate-pulse" aria-hidden="true" />
            </div>
          )}

          {/* Complete response card */}
          {message.status === 'complete' && (
            <AIResponseCard
              message={message}
              onBookmark={onBookmark}
              onContinueInvestigation={onContinueInvestigation}
            />
          )}

          <time
            className="text-[10px] text-light-text-muted"
            dateTime={message.timestamp}
          >
            {formatTime(message.timestamp)}
          </time>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatMessage;
