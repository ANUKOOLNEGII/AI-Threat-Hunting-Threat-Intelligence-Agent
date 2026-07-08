import React, { useState, useCallback } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  collapsible?: boolean;
}

const LANG_LABELS: Record<string, string> = {
  yaml: 'YAML', json: 'JSON', bash: 'BASH', python: 'Python',
  javascript: 'JavaScript', typescript: 'TypeScript', sql: 'SQL',
  powershell: 'PowerShell', sigma: 'Sigma', yara: 'YARA', xml: 'XML',
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = '', collapsible = false }) => {
  const [copied, setCopied]     = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const langLabel = LANG_LABELS[language.toLowerCase()] ?? (language.toUpperCase() || 'CODE');
  const lines = code.split('\n');
  const isLong = lines.length > 12;

  return (
    <div className="rounded-card border border-gray-200 dark:border-gray-700 overflow-hidden my-3 text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-gray-700">
        <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-light-text-muted">
          {langLabel}
        </span>
        <div className="flex items-center gap-1.5">
          {collapsible && isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-bg-hover transition-colors"
              aria-label={expanded ? 'Collapse code block' : 'Expand code block'}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-bg-hover transition-colors"
            aria-label="Copy code"
          >
            {copied
              ? <><Check className="h-3 w-3 text-positive" /> Copied</>
              : <><Copy className="h-3 w-3" /> Copy</>
            }
          </button>
        </div>
      </div>

      {/* Code body */}
      {expanded && (
        <div className="overflow-x-auto bg-gray-50 dark:bg-[#0d1117]">
          <table className="min-w-full border-collapse" aria-label={`${langLabel} code block`}>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-gray-100/50 dark:hover:bg-white/5">
                  <td
                    className="select-none pl-3 pr-4 py-0 text-right text-[10px] text-gray-400 dark:text-gray-600 font-mono w-8 shrink-0 border-r border-gray-200 dark:border-gray-700"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </td>
                  <td className="pl-4 pr-3 py-0 font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre">
                    {line || '\u00A0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
