import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bot, MessageSquare } from 'lucide-react';
import type { AppDispatch, RootState } from '../../redux/store';
import {
  createConversation, setActiveConversation, addUserMessage,
  deleteConversation, renameConversation, clearConversation,
  toggleSidebar, toggleBookmark,
} from '../../redux/slices/aiSlice';
import { SUGGESTED_QUESTIONS } from '../../redux/slices/aiSlice';
import { aiService } from '../../services/ai.service';
import type { AIMessage } from '../../types/ai.types';

import { ChatHeader }               from '../../components/ai/ChatHeader';
import { ChatMessage }              from '../../components/ai/ChatMessage';
import { PromptInput }              from '../../components/ai/PromptInput';
import { SuggestedQuestions }       from '../../components/ai/SuggestedQuestions';
import { ConversationSidebar }      from '../../components/ai/ConversationSidebar';
import { QuickActionToolbar }       from '../../components/ai/QuickActionToolbar';
import { InvestigationContextPanel } from '../../components/ai/InvestigationContextPanel';

function genId() { return Math.random().toString(36).slice(2, 11); }

/* ============================================================
   Empty state
   ============================================================ */
const EmptyChat: React.FC<{ onSelect: (prompt: string) => void }> = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center h-full py-12 px-6 space-y-6">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary-blue to-primary-sky dark:from-primary-sky dark:to-blue-400 text-white shadow-medium">
      <Bot className="h-8 w-8" aria-hidden="true" />
    </div>
    <div className="text-center space-y-2 max-w-md">
      <h2 className="text-lg font-black text-light-text-primary dark:text-dark-text-primary">
        AI Threat Intelligence Analyst
      </h2>
      <p className="text-sm text-light-text-muted leading-relaxed">
        Ask me anything about CVEs, malware families, IOCs, ransomware campaigns, or threat actors. I'll provide structured intelligence with source references.
      </p>
    </div>
    <div className="w-full max-w-xl">
      <SuggestedQuestions questions={SUGGESTED_QUESTIONS} onSelect={onSelect} />
    </div>
  </div>
);

/* ============================================================
   AI Assistant Page
   ============================================================ */

export const AIAssistantPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, activeConversationId, sidebarOpen } = useSelector(
    (state: RootState) => state.ai
  );

  const [prompt, setPrompt]         = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  /* ---------- Auto-scroll to bottom on new messages ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeConversation?.messages.length, isGenerating]);

  /* ---------- Start first conversation on mount ---------- */
  useEffect(() => {
    if (conversations.length === 0) {
      dispatch(createConversation('Welcome Session'));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Send message ---------- */
  const handleSend = useCallback(async (overridePrompt?: string) => {
    const text = (overridePrompt ?? prompt).trim();
    if (!text || isGenerating || !activeConversationId) return;

    setPrompt('');
    setError(null);
    setIsGenerating(true);

    /* Add user message immediately */
    const userMsg: AIMessage = {
      id: genId(),
      role: 'user',
      content: text,
      status: 'complete',
      timestamp: new Date().toISOString(),
    };
    dispatch(addUserMessage({ conversationId: activeConversationId, message: userMsg }));

    try {
      const response = await aiService.generateResponse(text);
      dispatch(addUserMessage({ conversationId: activeConversationId, message: response }));
    } catch {
      setError('AI service unavailable. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating, activeConversationId, dispatch]);

  /* ---------- New conversation ---------- */
  const handleNew = useCallback(async () => {
    const conv = await dispatch(createConversation()).unwrap();
    dispatch(setActiveConversation(conv.id));
  }, [dispatch]);

  /* ---------- Clear conversation ---------- */
  const handleClear = useCallback(() => {
    if (activeConversationId) dispatch(clearConversation(activeConversationId));
  }, [activeConversationId, dispatch]);

  /* ---------- Bookmark ---------- */
  const handleBookmark = useCallback((messageId: string) => {
    if (activeConversationId) dispatch(toggleBookmark({ conversationId: activeConversationId, messageId }));
  }, [activeConversationId, dispatch]);

  /* ---------- Continue investigation ---------- */
  const handleContinue = useCallback((content: string) => {
    setPrompt(`Based on the previous analysis:\n\n${content.slice(0, 200)}…\n\nContinue investigation and provide deeper technical details.`);
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden" aria-label="AI Analyst Assistant">
      {/* ---- Sidebar ---- */}
      {sidebarOpen && (
        <aside
          className="w-64 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800"
          aria-label="Conversation history"
        >
          <ConversationSidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={(id) => dispatch(setActiveConversation(id))}
            onNew={handleNew}
            onDelete={(id) => dispatch(deleteConversation(id))}
            onRename={(id, title) => dispatch(renameConversation({ id, title }))}
          />
        </aside>
      )}

      {/* ---- Main chat area ---- */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
        {/* Chat header */}
        <ChatHeader
          conversation={activeConversation}
          isGenerating={isGenerating}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => dispatch(toggleSidebar())}
          onClear={handleClear}
        />

        {/* Investigation context banner */}
        {activeConversation?.context && (
          <div className="px-4 pt-3">
            <InvestigationContextPanel context={activeConversation.context} />
          </div>
        )}

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scroll-smooth"
          role="log"
          aria-label="Conversation messages"
          aria-live="polite"
          aria-relevant="additions"
        >
          {(!activeConversation || activeConversation.messages.length === 0) && !isGenerating ? (
            <EmptyChat onSelect={(p) => handleSend(p)} />
          ) : (
            <>
              {activeConversation?.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={isGenerating}
                  onBookmark={handleBookmark}
                  onContinueInvestigation={handleContinue}
                />
              ))}

              {/* AI typing indicator when generating */}
              {isGenerating && (
                <ChatMessage
                  message={{
                    id: 'typing',
                    role: 'assistant',
                    content: '',
                    status: 'streaming',
                    timestamp: new Date().toISOString(),
                  }}
                  isStreaming
                />
              )}
            </>
          )}

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="rounded-card border border-severity-critical/30 bg-severity-critical/5 px-4 py-3 text-sm text-severity-critical flex items-center gap-2 mx-2"
            >
              <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-auto text-[11px] font-bold underline hover:no-underline"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Quick action toolbar */}
        <div className="px-4 pt-2 pb-1">
          <QuickActionToolbar
            onAction={(p) => handleSend(p)}
            onClear={handleClear}
            disabled={isGenerating}
          />
        </div>

        {/* Prompt input */}
        <div className="px-4 pt-1 pb-4">
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => handleSend()}
            isGenerating={isGenerating}
            disabled={!activeConversationId}
          />
          <p className="text-[10px] text-light-text-muted text-center mt-2">
            AI responses are simulated intelligence for demonstration. Always verify with authoritative sources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
