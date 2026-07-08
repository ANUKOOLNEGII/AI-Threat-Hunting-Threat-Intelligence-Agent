import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-light-bg-secondary via-light-bg-primary to-light-bg-secondary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-primary px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-8 shadow-large">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-center font-sans text-3xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">
            Aegis Intelligence
          </h2>
          <p className="mt-2 text-center text-sm text-light-text-muted dark:text-dark-text-muted">
            Enterprise Threat Hunting & Automation Platform
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
