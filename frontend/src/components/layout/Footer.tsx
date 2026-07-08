import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-secondary py-4 px-6 text-light-text-muted dark:text-dark-text-muted transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span>&copy; {new Date().getFullYear()} Aegis Security Platform. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary-blue transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary-blue transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary-blue transition-colors">Documentation</a>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-bold border border-gray-200 dark:border-gray-700">
            v1.0.0-phase1
          </span>
        </div>
      </div>
    </footer>
  );
};
