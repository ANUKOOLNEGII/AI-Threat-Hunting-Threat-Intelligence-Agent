import React from 'react';
import { Outlet } from 'react-router-dom';

export const ErrorLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary px-4 transition-colors duration-200">
      <div className="w-full max-w-md text-center">
        <Outlet />
      </div>
    </div>
  );
};
