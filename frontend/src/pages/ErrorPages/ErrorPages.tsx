import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, RefreshCw, Home, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// 1. 404 Not Found Page
export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-light-bg-secondary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary rounded-card border border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <AlertTriangle className="h-16 w-16 text-severity-medium mb-4 animate-bounce" />
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-sans">404</h1>
      <h2 className="mt-2 text-lg font-bold">Intelligence Feed Missing</h2>
      <p className="mt-2 text-sm text-light-text-muted dark:text-dark-text-muted max-w-md">
        The system path you requested could not be resolved. It is possible the page was decommissioned or moved to a secure partition.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

// 2. 403 Forbidden / Access Denied Page
export const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-light-bg-secondary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary rounded-card border border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <ShieldAlert className="h-16 w-16 text-severity-critical mb-4" />
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-sans">403</h1>
      <h2 className="mt-2 text-lg font-bold">Access Denied</h2>
      <p className="mt-2 text-sm text-light-text-muted dark:text-dark-text-muted max-w-md">
        Your security clearance role does not permit access to this module. Please coordinate with an administrator to update your credentials.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

// 3. 500 Server Error Page
export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-light-bg-secondary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary rounded-card border border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <AlertTriangle className="h-16 w-16 text-severity-critical mb-4" />
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-sans">500</h1>
      <h2 className="mt-2 text-lg font-bold">Internal Pipeline Failure</h2>
      <p className="mt-2 text-sm text-light-text-muted dark:text-dark-text-muted max-w-md">
        The threat analysis engine encountered an unhandled exception. The operations team has been notified.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" onClick={() => navigate(0)} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reload Page
        </Button>
        <Link to="/dashboard">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

// 4. Network Error Page
export const NetworkErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-light-bg-secondary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary rounded-card border border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <AlertTriangle className="h-16 w-16 text-severity-info mb-4" />
      <h1 className="text-3xl font-extrabold tracking-tight font-sans">Network Link Offline</h1>
      <p className="mt-2 text-sm text-light-text-muted dark:text-dark-text-muted max-w-md">
        The threat intelligence console is unable to contact external feed API endpoints. Please verify your internet link status.
      </p>
      <div className="mt-6">
        <Button onClick={() => navigate(0)} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    </div>
  );
};

// 5. Unauthorized Page
export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 bg-light-bg-secondary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary rounded-card border border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <ShieldCheck className="h-16 w-16 text-primary-blue mb-4" />
      <h1 className="text-3xl font-extrabold tracking-tight font-sans">Session Expired</h1>
      <p className="mt-2 text-sm text-light-text-muted dark:text-dark-text-muted max-w-md">
        Your security session token has expired or is invalid. Please sign in again.
      </p>
      <div className="mt-6">
        <Link to="/login">
          <Button className="gap-2">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
};
