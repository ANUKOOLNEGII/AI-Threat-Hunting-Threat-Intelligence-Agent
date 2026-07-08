import React, { useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

const MAX_CHARS = 2000;

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  placeholder?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  value, onChange, onSubmit, disabled = false, isGenerating = false,
  placeholder = 'Ask the AI analyst anything about your threat landscape…',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining   = MAX_CHARS - value.length;
  const canSubmit   = value.trim().length > 0 && !disabled && !isGenerating;

  /* Auto-grow textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  }, [canSubmit, onSubmit]);

  return (
    <div
      className={`rounded-card border transition-all duration-200 bg-white dark:bg-dark-bg-card shadow-small overflow-hidden ${
        disabled
          ? 'border-gray-200 dark:border-gray-800 opacity-60'
          : 'border-gray-300 dark:border-gray-700 focus-within:border-primary-blue dark:focus-within:border-primary-sky focus-within:shadow-medium'
      }`}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id="ai-prompt-input"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isGenerating}
        rows={1}
        maxLength={MAX_CHARS}
        className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-muted focus:outline-none disabled:cursor-not-allowed leading-relaxed"
        aria-label="AI analyst prompt input"
        aria-multiline="true"
        aria-describedby="prompt-char-count prompt-hint"
      />

      {/* Footer bar */}
      <div className="flex items-center justify-between px-3 pb-2.5 gap-2">
        {/* Left: future-ready placeholder actions */}
        <div className="flex items-center gap-1">
          <button
            disabled
            className="p-1.5 rounded text-light-text-muted opacity-40 cursor-not-allowed"
            title="Voice input — coming in Phase 9"
            aria-label="Voice input (not yet available)"
            tabIndex={-1}
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            disabled
            className="p-1.5 rounded text-light-text-muted opacity-40 cursor-not-allowed"
            title="File upload — coming in Phase 9"
            aria-label="File upload (not yet available)"
            tabIndex={-1}
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Right: char counter + send */}
        <div className="flex items-center gap-3">
          <span
            id="prompt-char-count"
            className={`text-[10px] font-mono tabular-nums ${
              remaining < 100
                ? remaining < 20 ? 'text-severity-critical' : 'text-severity-medium'
                : 'text-light-text-muted'
            }`}
            aria-live="polite"
            aria-label={`${remaining} characters remaining`}
          >
            {remaining < MAX_CHARS ? `${remaining} left` : ''}
          </span>

          <span id="prompt-hint" className="sr-only">
            Press Enter to send, Shift+Enter for new line
          </span>

          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            aria-label={isGenerating ? 'Generating response…' : 'Send message'}
            className={`flex items-center justify-center h-8 w-8 rounded-button transition-all duration-200 ${
              canSubmit
                ? 'bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 shadow-small active:scale-95'
                : 'bg-gray-100 dark:bg-gray-800 text-light-text-muted cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Generating status */}
      {isGenerating && (
        <div
          className="px-4 py-1.5 bg-primary-blue/5 dark:bg-primary-sky/5 border-t border-primary-blue/10 dark:border-primary-sky/10 text-[10px] text-primary-blue dark:text-primary-sky font-bold"
          role="status"
          aria-live="polite"
        >
          🤖 AI analyst is generating a response… Press Esc to cancel
        </div>
      )}
    </div>
  );
};

export default PromptInput;
