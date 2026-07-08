import React, { useState } from 'react';
import { Terminal, Copy, Check, FileDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import type { DetectionRule } from '../../types/cve.types';

interface DetectionRulesPanelProps {
  rules?: DetectionRule[];
}

export const DetectionRulesPanel: React.FC<DetectionRulesPanelProps> = ({ rules }) => {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (rule: DetectionRule) => {
    navigator.clipboard.writeText(rule.content).then(() => {
      setCopiedId(rule.id);
      toast.success(`${rule.type.toUpperCase()} rule content copied.`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (!rules || rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-light-text-muted dark:text-dark-text-muted">
        <Terminal className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
        <p className="text-xs font-semibold">No detection rules available for this vulnerability.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-label="Detection Rules">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="rounded-card border border-gray-200 dark:border-gray-800 bg-light-bg-secondary dark:bg-dark-bg-primary overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky px-2 py-0.5 rounded border border-primary-blue/20 dark:border-primary-sky/20">
                {rule.type}
              </span>
              <span className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">
                {rule.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(rule)}
                className="h-7 w-7 text-light-text-muted hover:text-light-text-primary"
                aria-label={`Copy ${rule.type} rule`}
              >
                {copiedId === rule.id ? (
                  <Check className="h-3.5 w-3.5 text-severity-low" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toast.info('Download functionality — Phase 7 implementation')}
                className="h-7 w-7 text-light-text-muted hover:text-light-text-primary"
                aria-label={`Download ${rule.type} rule`}
              >
                <FileDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Code block */}
          <div className="p-4 overflow-x-auto">
            <pre className="text-[11px] font-mono text-light-text-primary dark:text-dark-text-primary leading-relaxed whitespace-pre">
              <code>{rule.content}</code>
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetectionRulesPanel;
