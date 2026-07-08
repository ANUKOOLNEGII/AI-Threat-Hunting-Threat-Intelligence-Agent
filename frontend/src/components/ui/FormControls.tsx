import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

// Common types for form wrappers
interface FieldWrapperProps {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  id?: string;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, error, helperText, children, id }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold tracking-wide uppercase text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-severity-critical font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-light-text-muted dark:text-dark-text-muted">{helperText}</p>}
    </div>
  );
};

// Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, icon, id, type = 'text', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <FieldWrapper label={label} error={error} helperText={helperText} id={inputId}>
        <div className="relative w-full">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-light-text-muted dark:text-dark-text-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={`w-full h-11 rounded-lg border bg-white dark:bg-dark-bg-primary pl-3 pr-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none transition-all ${
              icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-severity-critical focus:ring-2 focus:ring-severity-critical/20 focus:border-severity-critical'
                : 'border-gray-300 dark:border-gray-800 focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue'
            } ${className}`}
            {...props}
          />
        </div>
      </FieldWrapper>
    );
  }
);
Input.displayName = 'Input';

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <FieldWrapper label={label} error={error} helperText={helperText} id={textareaId}>
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full rounded-lg border bg-white dark:bg-dark-bg-primary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none transition-all min-h-[100px] ${
            error
              ? 'border-severity-critical focus:ring-2 focus:ring-severity-critical/20 focus:border-severity-critical'
              : 'border-gray-300 dark:border-gray-800 focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue'
          } ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Textarea.displayName = 'Textarea';

// Checkbox Component
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 dark:border-gray-800 bg-white dark:bg-dark-bg-primary text-primary-blue focus:ring-primary-blue ${className}`}
            {...props}
          />
          <label htmlFor={checkboxId} className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            {label}
          </label>
        </div>
        {error && <p className="text-xs text-severity-critical font-medium">{error}</p>}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// Radio Component
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <input
          id={radioId}
          ref={ref}
          type="radio"
          className={`h-4 w-4 border-gray-300 dark:border-gray-800 bg-white dark:bg-dark-bg-primary text-primary-blue focus:ring-primary-blue ${className}`}
          {...props}
        />
        <label htmlFor={radioId} className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </label>
      </div>
    );
  }
);
Radio.displayName = 'Radio';

// Dropdown/Select Component
export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ className = '', label, error, helperText, id, options, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <FieldWrapper label={label} error={error} helperText={helperText} id={selectId}>
        <div className="relative w-full">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-11 appearance-none rounded-lg border bg-white dark:bg-dark-bg-primary pl-4 pr-10 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary focus:outline-none transition-all ${
              error
                ? 'border-severity-critical focus:ring-2 focus:ring-severity-critical/20 focus:border-severity-critical'
                : 'border-gray-300 dark:border-gray-800 focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary py-2">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-light-text-muted dark:text-dark-text-muted">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </FieldWrapper>
    );
  }
);
Dropdown.displayName = 'Dropdown';
