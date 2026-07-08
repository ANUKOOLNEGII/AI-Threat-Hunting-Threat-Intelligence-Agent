import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary">
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-light-bg-primary/80 dark:bg-dark-bg-primary/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-primary-blue dark:text-primary-sky">
            <Shield className="h-6 w-6" />
            <span className="font-sans text-lg font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">
              Aegis Threat Hunter
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium hover:text-primary-blue transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-light-bg-secondary dark:bg-dark-bg-secondary py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-light-text-muted dark:text-dark-text-muted">
          &copy; {new Date().getFullYear()} Aegis Security. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
