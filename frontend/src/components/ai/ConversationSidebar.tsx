import React, { useState } from 'react';
import {
  MessageSquare, Plus, Search, Trash2, Pencil, Check, X,
  Clock, ChevronRight,
} from 'lucide-react';
import type { AIConversation } from '../../types/ai.types';
import { ConversationSidebarSkeleton } from './AISkeletons';

interface ConversationSidebarProps {
  conversations: AIConversation[];
  activeId: string | null;
  loading?: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations, activeId, loading = false, onSelect, onNew, onDelete, onRename,
}) => {
  const [search, setSearch]           = useState('');
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editTitle, setEditTitle]     = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (c: AIConversation) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const commitEdit = (id: string) => {
    if (editTitle.trim()) onRename(id, editTitle.trim());
    setEditingId(null);
  };

  return (
    <nav
      className="flex flex-col h-full bg-light-bg-secondary dark:bg-dark-bg-secondary border-r border-gray-200 dark:border-gray-800"
      aria-label="Conversation history"
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary-blue dark:text-primary-sky" aria-hidden="true" />
            <h2 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
              Conversations
            </h2>
          </div>
          <button
            onClick={onNew}
            className="flex items-center justify-center h-7 w-7 rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors shadow-small"
            aria-label="Start new conversation"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-light-text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-7 pr-3 py-1.5 text-[11px] rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-muted focus:outline-none focus:border-primary-blue dark:focus:border-primary-sky"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {loading ? (
          <ConversationSidebarSkeleton />
        ) : filtered.length === 0 ? (
          <div className="px-4 py-8 text-center space-y-1.5">
            <MessageSquare className="h-6 w-6 text-light-text-muted mx-auto" aria-hidden="true" />
            <p className="text-[11px] text-light-text-muted">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </p>
            {!search && (
              <button onClick={onNew} className="text-[11px] font-bold text-primary-blue dark:text-primary-sky hover:underline">
                Start your first conversation
              </button>
            )}
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive  = conv.id === activeId;
            const isEditing = editingId === conv.id;
            const isDeleting = deleteConfirm === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative mx-2 rounded-card transition-colors ${
                  isActive
                    ? 'bg-primary-blue/10 dark:bg-primary-sky/10 border border-primary-blue/20 dark:border-primary-sky/20'
                    : 'hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover border border-transparent'
                }`}
              >
                {isEditing ? (
                  /* Rename mode */
                  <div className="flex items-center gap-1.5 p-2">
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit(conv.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 text-xs bg-white dark:bg-dark-bg-card border border-primary-blue dark:border-primary-sky rounded px-2 py-1 text-light-text-primary dark:text-dark-text-primary focus:outline-none"
                      aria-label="Rename conversation"
                    />
                    <button onClick={() => commitEdit(conv.id)} className="p-1 text-positive hover:bg-positive-bg rounded transition-colors" aria-label="Save name"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-light-text-muted hover:bg-gray-100 dark:hover:bg-dark-bg-hover rounded transition-colors" aria-label="Cancel rename"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : isDeleting ? (
                  /* Delete confirm */
                  <div className="flex items-center gap-1.5 p-2.5">
                    <p className="text-[10px] font-bold text-severity-critical flex-1">Delete?</p>
                    <button onClick={() => { onDelete(conv.id); setDeleteConfirm(null); }} className="text-[10px] font-bold text-severity-critical border border-severity-critical/30 rounded px-2 py-0.5 hover:bg-severity-critical/10 transition-colors">Yes</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-[10px] font-bold text-light-text-muted border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors">No</button>
                  </div>
                ) : (
                  /* Normal item */
                  <button
                    onClick={() => onSelect(conv.id)}
                    className="w-full text-left p-2.5 pr-14"
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`Open conversation: ${conv.title}`}
                  >
                    <p className={`text-[11px] font-bold truncate ${isActive ? 'text-primary-blue dark:text-primary-sky' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                      {conv.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="h-2.5 w-2.5 text-light-text-muted" aria-hidden="true" />
                      <span className="text-[10px] text-light-text-muted">{relativeTime(conv.updatedAt)}</span>
                      <span className="text-[10px] text-light-text-muted">· {conv.messageCount} msg</span>
                    </div>
                  </button>
                )}

                {/* Action icons (hover) */}
                {!isEditing && !isDeleting && (
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(conv)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Rename conversation">
                      <Pencil className="h-3 w-3 text-light-text-muted" />
                    </button>
                    <button onClick={() => setDeleteConfirm(conv.id)} className="p-1 rounded hover:bg-severity-critical/10 transition-colors" aria-label="Delete conversation">
                      <Trash2 className="h-3 w-3 text-severity-critical" />
                    </button>
                    <ChevronRight className="h-3 w-3 text-light-text-muted" aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-gray-200 dark:border-gray-800 text-[10px] text-light-text-muted text-center">
        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
      </div>
    </nav>
  );
};

export default ConversationSidebar;
