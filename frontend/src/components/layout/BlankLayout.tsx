import React from 'react';
import { Outlet } from 'react-router-dom';

export const BlankLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-200">
      <Outlet />
    </div>
  );
};
