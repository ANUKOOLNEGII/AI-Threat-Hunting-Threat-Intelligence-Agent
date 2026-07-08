import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Command, X, CornerDownLeft, Clock, ArrowUpRight } from 'lucide-react';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
}

const SUGGESTIONS = [
  { text: 'CVE-2026-45678 (CMS bypass)', category: 'Vulnerability' },
  { text: 'Cl0p Ransomware loader', category: 'Campaign' },
  { text: 'Malicious domain spoofs', category: 'Phishing' },
  { text: 'YARA rules AcmeWeb', category: 'Mitigation' },
];

const STORAGE_KEY = 'recent_threat_searches';
const MAX_RECENT = 5;

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSearch }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : ['LockBit v9', 'CVE-2026-34567', 'secure-acmecorp.com'];
    } catch {
      return [];
    }
  });

  // Cmd/Ctrl + K toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const filtered = recentSearches.filter((x) => x !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch { /* ignore storage errors */ }

      onSearch?.(trimmed);
      setQuery('');
      onClose();
    },
    [recentSearches, onSearch, onClose]
  );

  const filteredSuggestions = SUGGESTIONS.filter((s) =>
    s.text.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global threat search"
        className="w-full max-w-lg z-10 overflow-hidden rounded-modal border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card shadow-large flex flex-col animate-fade-in"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <Search className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search CVEs, threat groups, hashes, IOCs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(query);
            }}
            className="flex-1 bg-transparent text-sm focus:outline-none text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-muted dark:placeholder:text-dark-text-muted"
            aria-label="Search query"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4 text-light-text-muted" />
            </button>
          ) : (
            <span
              className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-light-text-muted border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded bg-gray-50 dark:bg-dark-bg-primary select-none"
              aria-label="Keyboard shortcut: Command K"
            >
              <Command className="h-2.5 w-2.5" aria-hidden="true" />K
            </span>
          )}
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-4 space-y-4">
          {/* Suggestions */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-light-text-muted uppercase tracking-wider">
              {query ? 'Matched Indicators' : 'Query Suggestions'}
            </h3>
            {filteredSuggestions.length > 0 ? (
              <div className="space-y-0.5" role="listbox" aria-label="Suggestions">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s.text}
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSubmit(s.text)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <span className="font-semibold text-light-text-primary dark:text-dark-text-primary group-hover:text-primary-blue dark:group-hover:text-primary-sky transition-colors">
                      {s.text}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary-blue/10 text-primary-blue dark:text-primary-sky dark:bg-primary-sky/10 rounded-badge uppercase font-bold shrink-0 ml-2">
                      {s.category}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted px-3 py-2">
                No matches found. Press Enter to search.
              </p>
            )}
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && !query && (
            <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-[10px] font-bold text-light-text-muted uppercase tracking-wider">
                Recent Searches
              </h3>
              <div className="space-y-0.5" role="list" aria-label="Recent searches">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    role="listitem"
                    onClick={() => handleSubmit(term)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary transition-colors group"
                  >
                    <Clock className="h-3.5 w-3.5 text-light-text-muted shrink-0" aria-hidden="true" />
                    <span className="flex-1">{term}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-light-text-muted opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center bg-gray-50 dark:bg-dark-bg-secondary/40 px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-light-text-muted dark:text-dark-text-muted">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-severity-low animate-pulse" aria-hidden="true" />
            Threat index synchronized
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
            to search
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
