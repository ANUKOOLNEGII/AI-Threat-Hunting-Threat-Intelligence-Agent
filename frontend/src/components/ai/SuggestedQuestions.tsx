import React from 'react';
import { Lightbulb } from 'lucide-react';
import type { SuggestedQuestion } from '../../types/ai.types';

const CATEGORY_COLORS: Record<SuggestedQuestion['category'], string> = {
  cve:        'hover:border-severity-critical/40 hover:bg-severity-critical/5 dark:hover:border-severity-critical/30',
  malware:    'hover:border-severity-high/40 hover:bg-severity-high/5 dark:hover:border-severity-high/30',
  ioc:        'hover:border-primary-blue/40 hover:bg-primary-blue/5 dark:hover:border-primary-sky/40 dark:hover:bg-primary-sky/5',
  ransomware: 'hover:border-severity-medium/40 hover:bg-severity-medium/5 dark:hover:border-severity-medium/30',
  phishing:   'hover:border-severity-medium/40 hover:bg-severity-medium/5',
  general:    'hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-bg-hover',
};

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelect: (prompt: string) => void;
  className?: string;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions, onSelect, className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    <div className="flex items-center gap-2">
      <Lightbulb className="h-4 w-4 text-severity-medium" aria-hidden="true" />
      <h2 className="text-xs font-black uppercase tracking-wider text-light-text-muted">
        Suggested Queries
      </h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {questions.map((q) => (
        <button
          key={q.id}
          onClick={() => onSelect(q.prompt)}
          className={`text-left p-3 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card transition-all duration-200 group ${CATEGORY_COLORS[q.category]}`}
          aria-label={`Ask: ${q.label}`}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-lg leading-none shrink-0" aria-hidden="true">{q.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary group-hover:text-primary-blue dark:group-hover:text-primary-sky transition-colors leading-tight">
                {q.label}
              </p>
              <p className="text-[10px] text-light-text-muted mt-0.5 leading-tight line-clamp-2">
                {q.prompt.slice(0, 80)}…
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default SuggestedQuestions;
