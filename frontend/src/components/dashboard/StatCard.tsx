import React from 'react';
import { Card } from '../ui/Feedback';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  metric?: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  percentage?: string | number;
  trendLabel?: string;
  loading?: boolean;
  isEmpty?: boolean;
  description?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'primary';
}

const iconColors: Record<string, string> = {
  primary: 'bg-primary-blue/10 text-primary-blue dark:bg-primary-sky/10 dark:text-primary-sky',
  danger: 'bg-severity-critical/10 text-severity-critical',
  warning: 'bg-severity-medium/10 text-severity-medium',
  success: 'bg-severity-low/10 text-severity-low',
  info: 'bg-severity-info/10 text-severity-info',
};

const trendUpColor: Record<string, string> = {
  danger: 'text-severity-critical',
  warning: 'text-severity-medium',
  success: 'text-severity-low',
  info: 'text-severity-info',
  primary: 'text-primary-sky',
};

const trendDownColor: Record<string, string> = {
  danger: 'text-severity-low',
  warning: 'text-severity-low',
  success: 'text-severity-critical',
  info: 'text-severity-info',
  primary: 'text-gray-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  metric,
  icon: Icon,
  trend,
  percentage,
  trendLabel = 'vs last 24h',
  loading = false,
  isEmpty = false,
  description,
  variant = 'primary',
}) => {
  if (loading) {
    return (
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-7 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </Card>
    );
  }

  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    if (trend === 'up') return trendUpColor[variant] ?? 'text-primary-sky';
    if (trend === 'down') return trendDownColor[variant] ?? 'text-gray-400';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5" />;
    if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  return (
    <Card className="flex flex-col gap-2 relative overflow-hidden transition-all duration-200 hover:shadow-medium">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-full shrink-0 ${iconColors[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        {isEmpty ? (
          <span className="text-sm font-semibold text-light-text-muted dark:text-dark-text-muted">
            No Data
          </span>
        ) : (
          <span className="text-2xl font-extrabold font-sans text-light-text-primary dark:text-dark-text-primary">
            {metric}
          </span>
        )}
      </div>

      {/* Trend indicator row */}
      {!isEmpty && (trend || percentage) && (
        <div className="flex items-center gap-1.5 text-xs text-light-text-muted dark:text-dark-text-muted mt-1.5 border-t border-gray-100 dark:border-gray-800/40 pt-2">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 font-bold ${getTrendColor()}`}>
              {getTrendIcon()}
              {percentage}%
            </span>
          )}
          <span className="text-[10px] text-light-text-muted dark:text-dark-text-muted">
            {trendLabel}
          </span>
        </div>
      )}

      {description && !trend && (
        <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-1">
          {description}
        </p>
      )}
    </Card>
  );
};

export default StatCard;
