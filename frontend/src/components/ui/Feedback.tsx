import React from 'react';

// 1. Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary border border-gray-200 dark:border-gray-700',
    success: 'bg-severity-low/10 text-severity-low border border-severity-low/20',
    warning: 'bg-severity-medium/10 text-severity-medium border border-severity-medium/20',
    danger: 'bg-severity-critical/10 text-severity-critical border border-severity-critical/20',
    info: 'bg-severity-info/10 text-severity-info border border-severity-info/20',
  };

  return (
    <span className={`inline-flex items-center rounded-badge px-2 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
};

// 2. StatusBadge Component (for threat level severity tags)
interface StatusBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ severity }) => {
  const mapping = {
    critical: { text: 'Critical', style: 'bg-severity-critical/15 text-severity-critical border border-severity-critical/25' },
    high: { text: 'High', style: 'bg-severity-high/15 text-severity-high border border-severity-high/25' },
    medium: { text: 'Medium', style: 'bg-severity-medium/15 text-severity-medium border border-severity-medium/25' },
    low: { text: 'Low', style: 'bg-severity-low/15 text-severity-low border border-severity-low/25' },
    info: { text: 'Informational', style: 'bg-severity-info/15 text-severity-info border border-severity-info/25' },
  };

  const current = mapping[severity];

  return (
    <span className={`inline-flex items-center rounded-badge px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${current.style}`}>
      {current.text}
    </span>
  );
};

// 3. Avatar Component
interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name = 'User', src, size = 'md' }) => {
  const sizes = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-lg',
  };

  if (src) {
    return <img src={src} alt={name} className={`rounded-full object-cover ${sizes[size]}`} />;
  }

  return (
    <div className={`flex items-center justify-center rounded-full bg-primary-blue text-white font-bold uppercase ${sizes[size]}`}>
      {name[0]}
    </div>
  );
};

// 4. Card Component
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  interactive = false,
}) => {
  return (
    <div
      className={`rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-5 shadow-small ${
        interactive ? 'hover-card cursor-pointer' : ''
      } ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h4 className="font-sans text-base font-bold text-light-text-primary dark:text-dark-text-primary">{title}</h4>}
          {subtitle && <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="text-sm">{children}</div>
      {footer && (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-850 pt-3 flex justify-between items-center text-xs">
          {footer}
        </div>
      )}
    </div>
  );
};

// 5. Spinner Component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-primary-blue border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

// 6. Alert Component
interface AlertProps {
  title?: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ title, message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-severity-low/10 border-severity-low/25 text-severity-low',
    warning: 'bg-severity-medium/10 border-severity-medium/25 text-severity-medium',
    error: 'bg-severity-critical/10 border-severity-critical/25 text-severity-critical',
    info: 'bg-severity-info/10 border-severity-info/25 text-severity-info',
  };

  return (
    <div
      role="alert"
      className={`relative rounded-card border p-4 flex gap-3 text-sm ${colors[type]}`}
    >
      <div className="flex-1">
        {title && <h5 className="font-bold mb-1">{title}</h5>}
        <p className="font-medium text-xs">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="h-4 w-4 opacity-75 hover:opacity-100 font-bold ml-auto"
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

// 7. Divider Component
export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <hr className={`my-4 border-gray-200 dark:border-gray-800 ${className}`} />;
};

// 8. Tag/Chip Component
interface ChipProps {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, onRemove, onClick }) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-light-text-secondary dark:text-dark-text-secondary transition-colors ${
        onClick ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700' : ''
      }`}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-severity-critical font-bold text-[10px]"
          aria-label={`Remove tag ${label}`}
        >
          &times;
        </button>
      )}
    </span>
  );
};
