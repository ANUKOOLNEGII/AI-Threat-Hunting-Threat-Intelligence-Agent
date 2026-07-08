import React from 'react';
import { ShieldAlert, FileSearch, Code2, AlignLeft, Trash2 } from 'lucide-react';

interface QuickAction { id: string; label: string; prompt: string; icon: React.FC<{ className?: string }>; color: string; }

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', label: 'Analyze Threat',   icon: ShieldAlert,  color: 'text-severity-critical hover:bg-severity-critical/10 hover:border-severity-critical/30', prompt: 'Analyze the current threat landscape and provide a comprehensive risk assessment with mitigation recommendations.' },
  { id: 'qa-2', label: 'Explain CVE',      icon: FileSearch,   color: 'text-primary-blue dark:text-primary-sky hover:bg-primary-blue/10 dark:hover:bg-primary-sky/10 hover:border-primary-blue/30', prompt: 'Explain the most critical CVE in the current feed, including CVSS score, attack vector, affected systems, and remediation steps.' },
  { id: 'qa-3', label: 'Generate Rule',    icon: Code2,        color: 'text-severity-medium hover:bg-severity-medium/10 hover:border-severity-medium/30', prompt: 'Generate a Sigma detection rule for the most recent active malware family in the threat feed.' },
  { id: 'qa-4', label: 'Summarize Threat', icon: AlignLeft,    color: 'text-severity-info hover:bg-severity-info/10 hover:border-severity-info/30', prompt: 'Provide an executive-level summary of today\'s threat landscape suitable for a CISO briefing.' },
];

interface QuickActionToolbarProps {
  onAction: (prompt: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  onAction, onClear, disabled = false,
}) => (
  <div
    className="flex flex-wrap items-center gap-2"
    role="toolbar"
    aria-label="Quick analyst actions"
  >
    {QUICK_ACTIONS.map((action) => (
      <button
        key={action.id}
        onClick={() => onAction(action.prompt)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-xs font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
        aria-label={`Quick action: ${action.label}`}
      >
        <action.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">{action.label}</span>
      </button>
    ))}

    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" aria-hidden="true" />

    <button
      onClick={onClear}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-card text-xs font-bold text-light-text-muted hover:text-severity-critical hover:border-severity-critical/30 hover:bg-severity-critical/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Clear chat"
    >
      <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">Clear Chat</span>
    </button>
  </div>
);

export default QuickActionToolbar;
