import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { Breadcrumb } from '../ui/Breadcrumb';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setMobileMenuOpen } from '../../redux/slices/uiSlice';

export const DashboardLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const mobileMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-200">
      {/* Mobile Sidebar overlay backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => dispatch(setMobileMenuOpen(false))}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop static & Mobile overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        <Sidebar />
      </div>

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
