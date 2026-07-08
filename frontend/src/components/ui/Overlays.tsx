import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

// 1. Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex flex-col w-full ${sizes[size]} z-10 overflow-hidden max-h-[95vh] rounded-modal border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-large transform transition-all`}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <h3 id="modal-title" className="font-sans text-base font-bold text-light-text-primary dark:text-dark-text-primary">
            {title}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-none flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800 px-6 py-4 bg-light-bg-secondary dark:bg-dark-bg-secondary/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Drawer Component
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positions = {
    left: 'left-0 h-full w-full max-w-md border-r animate-slide-in',
    right: 'right-0 h-full w-full max-w-md border-l animate-slide-in',
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-10 flex flex-col bg-white dark:bg-dark-bg-card border-gray-200 dark:border-gray-800 shadow-large ${positions[position]}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <h3 className="font-sans text-base font-bold text-light-text-primary dark:text-dark-text-primary">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
};

// 3. Tooltip Component
interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="group relative inline-block">
      {children}
      <div
        className={`pointer-events-none absolute z-50 scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 ${positions[position]}`}
      >
        <div className="rounded bg-gray-900 px-2 py-1 text-[10px] font-medium text-white shadow-small whitespace-nowrap">
          {content}
        </div>
      </div>
    </div>
  );
};

// 4. Popover Component
interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, children, isOpen, onToggle }) => {
  return (
    <div className="relative inline-block text-left">
      <div onClick={onToggle}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 mt-2 z-40 w-56 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-4 shadow-medium focus:outline-none">
          {children}
        </div>
      )}
    </div>
  );
};
