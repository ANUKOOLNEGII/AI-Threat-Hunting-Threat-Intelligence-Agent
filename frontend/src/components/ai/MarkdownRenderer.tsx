import React from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight zero-dependency markdown renderer.
 * Supports: h1-h4, bold, italic, inline-code, code blocks (with language),
 * unordered/ordered lists, blockquotes, horizontal rules, and plain paragraphs.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyIdx = 0;

  const key = () => `md-${keyIdx++}`;

  /* Inline formatting — bold, italic, inline-code */
  function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    // Regex matches: `code`, **bold**, *italic*
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index));
      const raw = match[0];
      if (raw.startsWith('`')) {
        parts.push(
          <code key={key()} className="px-1 py-0.5 rounded text-[11px] font-mono bg-gray-100 dark:bg-gray-800 text-primary-blue dark:text-primary-sky border border-gray-200 dark:border-gray-700">
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith('**')) {
        parts.push(<strong key={key()} className="font-bold">{raw.slice(2, -2)}</strong>);
      } else if (raw.startsWith('*')) {
        parts.push(<em key={key()} className="italic">{raw.slice(1, -1)}</em>);
      }
      last = match.index + raw.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length > 0 ? parts : text;
  }

  while (i < lines.length) {
    const line = lines[i];

    /* ---- Code block ---- */
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(<CodeBlock key={key()} code={codeLines.join('\n')} language={lang} collapsible />);
      i++;
      continue;
    }

    /* ---- Headings ---- */
    if (line.startsWith('#### ')) {
      elements.push(<h4 key={key()} className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary mt-4 mb-1.5">{renderInline(line.slice(5))}</h4>);
      i++; continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key()} className="text-sm font-black text-light-text-primary dark:text-dark-text-primary mt-5 mb-2 flex items-center gap-2 after:flex-1 after:h-px after:bg-gray-200 dark:after:bg-gray-700">{renderInline(line.slice(4))}</h3>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key()} className="text-base font-black text-light-text-primary dark:text-dark-text-primary mt-6 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-700">{renderInline(line.slice(3))}</h2>);
      i++; continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key()} className="text-lg font-black text-light-text-primary dark:text-dark-text-primary mt-2 mb-3">{renderInline(line.slice(2))}</h1>);
      i++; continue;
    }

    /* ---- Blockquote ---- */
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key()} className="border-l-4 border-primary-blue dark:border-primary-sky pl-4 my-2 text-sm text-light-text-secondary dark:text-dark-text-secondary italic">
          {renderInline(line.slice(2))}
        </blockquote>
      );
      i++; continue;
    }

    /* ---- Horizontal rule ---- */
    if (line === '---' || line === '***' || line === '___') {
      elements.push(<hr key={key()} className="my-4 border-gray-200 dark:border-gray-700" />);
      i++; continue;
    }

    /* ---- Unordered list ---- */
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key()} className="space-y-1 my-2 pl-0" role="list">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-blue dark:bg-primary-sky shrink-0" aria-hidden="true" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    /* ---- Ordered list ---- */
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      let n = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={key()} className="space-y-1 my-2 pl-0" role="list">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <span className="mt-0.5 h-5 w-5 rounded-full bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky text-[10px] font-black flex items-center justify-center shrink-0">
                {n++}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    /* ---- Empty line ---- */
    if (line.trim() === '') { i++; continue; }

    /* ---- Paragraph ---- */
    elements.push(
      <p key={key()} className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed my-1">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return (
    <div className={`markdown-body ${className}`} role="article">
      {elements}
    </div>
  );
};

export default MarkdownRenderer;
