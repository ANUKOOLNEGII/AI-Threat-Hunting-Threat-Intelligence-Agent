import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (msg: string, dur?: number) => string;
    error: (msg: string, dur?: number) => string;
    warning: (msg: string, dur?: number) => string;
    info: (msg: string, dur?: number) => string;
    loading: (msg: string, dur?: number) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000): string => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (type !== 'loading') {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (msg: string, dur?: number) => addToast(msg, 'success', dur),
    error: (msg: string, dur?: number) => addToast(msg, 'error', dur),
    warning: (msg: string, dur?: number) => addToast(msg, 'warning', dur),
    info: (msg: string, dur?: number) => addToast(msg, 'info', dur),
    loading: (msg: string, dur?: number) => addToast(msg, 'loading', dur),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      {/* Toast container overlay viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle className="h-5 w-5 text-severity-low" />,
            error: <AlertCircle className="h-5 w-5 text-severity-critical" />,
            warning: <AlertCircle className="h-5 w-5 text-severity-medium" />,
            info: <Info className="h-5 w-5 text-severity-info" />,
            loading: <Loader2 className="h-5 w-5 text-primary-blue animate-spin" />,
          };

          const themes = {
            success: 'border-severity-low/20 bg-white dark:bg-dark-bg-card dark:border-severity-low/20',
            error: 'border-severity-critical/20 bg-white dark:bg-dark-bg-card dark:border-severity-critical/20',
            warning: 'border-severity-medium/20 bg-white dark:bg-dark-bg-card dark:border-severity-medium/20',
            info: 'border-severity-info/20 bg-white dark:bg-dark-bg-card dark:border-severity-info/20',
            loading: 'border-primary-blue/20 bg-white dark:bg-dark-bg-card dark:border-primary-blue/20',
          };

          return (
            <div
              key={t.id}
              role="alert"
              className={`flex items-start gap-3 p-3.5 rounded-card border shadow-medium animate-fade-in pointer-events-auto transition-colors duration-200 ${themes[t.type]}`}
            >
              <div className="shrink-0">{icons[t.type]}</div>
              <div className="flex-1 text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
