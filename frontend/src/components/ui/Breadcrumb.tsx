import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-xs font-medium text-light-text-muted dark:text-dark-text-muted mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center hover:text-primary-blue dark:hover:text-primary-sky transition-colors"
          >
            <Home className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = name.replace(/-/g, ' ');

          return (
            <li key={name} className="flex items-center">
              <ChevronRight className="mx-1 h-3.5 w-3.5 shrink-0" />
              {isLast ? (
                <span className="capitalize text-light-text-primary dark:text-dark-text-primary" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="capitalize hover:text-primary-blue dark:hover:text-primary-sky transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
