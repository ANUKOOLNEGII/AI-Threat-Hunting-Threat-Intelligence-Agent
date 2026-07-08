import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { Breadcrumb } from '../ui/Breadcrumb';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-200">
      {/* Sidebar - Handles its own mobile overlay/desktop static behavior internally now */}
      <Sidebar />

      {/* Content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 bg-light-bg-secondary dark:bg-dark-bg-primary">
          <div className="mx-auto max-w-7xl">
            <Breadcrumb />
            <div className="min-h-[calc(100vh-12rem)]">
              <Outlet />
            </div>
          </div>
          <div className="mt-8">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};
