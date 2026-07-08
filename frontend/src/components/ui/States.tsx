import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

// 1. EmptyState Component
interface EmptyStateProps {
  title?: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Discovered',
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-card bg-light-bg-secondary/40 dark:bg-dark-bg-card/20 min-h-[220px]">
      <Inbox className="h-10 w-10 text-light-text-muted dark:text-dark-text-muted mb-3" />
      <h5 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-1">{title}</h5>
      <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

// 2. ErrorState Component (for inside widgets/cards)
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Fetch Interrupted',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-severity-critical/20 rounded-card bg-severity-critical/5 min-h-[200px]">
      <AlertCircle className="h-10 w-10 text-severity-critical mb-3" />
      <h5 className="text-sm font-bold text-severity-critical mb-1">{title}</h5>
      <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
};

// 3. PageHeader Component
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-5">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

// 4. Container Component
export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

// 5. Section Component
interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => {
  return (
    <section className={`space-y-4 ${className}`}>
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted border-b border-gray-100 dark:border-gray-850 pb-2">
          {title}
        </h4>
      )}
      <div>{children}</div>
    </section>
  );
};
