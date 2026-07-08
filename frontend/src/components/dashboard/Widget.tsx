import React from 'react';
import { Card } from '../ui/Feedback';
import { Spinner } from '../ui/Feedback';
import { Button } from '../ui/Button';
import { RefreshCw, Download, AlertCircle } from 'lucide-react';

interface WidgetProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onRetry?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const Widget: React.FC<WidgetProps> = ({
  title,
  description,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'No threat activity recorded.',
  onRefresh,
  onExport,
  onRetry,
  children,
  actions,
  className = '',
}) => {
  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Widget Header */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
        <div>
          <h4 className="font-sans text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
            {title}
          </h4>
          {description && (
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {actions}
          {onExport && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              title="Export Widget Data"
              className="h-7 w-7"
              aria-label="Export Widget Data"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Data"
              className="h-7 w-7"
              aria-label="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Widget Content Area */}
      <div className="flex-1 relative min-h-[140px] flex flex-col justify-center">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-dark-bg-card/60 backdrop-blur-sm z-10 rounded-card">
            <Spinner size="md" />
          </div>
        )}

        {error && !loading ? (
          <div className="text-center p-4 space-y-3">
            <div className="flex justify-center">
              <AlertCircle className="h-8 w-8 text-severity-critical" />
            </div>
            <p className="text-xs font-semibold text-severity-critical">{error}</p>
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5 mx-auto">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        ) : isEmpty && !loading ? (
          <div className="text-center p-6 text-xs text-light-text-muted dark:text-dark-text-muted">
            {emptyMessage}
          </div>
        ) : (
          <div className="h-full w-full">{children}</div>
        )}
      </div>
    </Card>
  );
};

export default Widget;
