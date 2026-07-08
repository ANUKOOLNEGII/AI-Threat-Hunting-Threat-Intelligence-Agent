import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    
    const baseStyle = 'inline-flex items-center justify-center font-sans font-medium rounded-button transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-primary-blue hover:bg-blue-700 text-white dark:ring-offset-dark-bg-primary focus:ring-primary-blue',
      secondary: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:ring-gray-400',
      danger: 'bg-severity-critical hover:bg-red-700 text-white focus:ring-severity-critical',
      outline: 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-primary dark:text-dark-text-primary focus:ring-primary-blue',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary focus:ring-gray-400',
      link: 'text-primary-blue hover:underline p-0 active:scale-100 focus:ring-primary-blue',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
