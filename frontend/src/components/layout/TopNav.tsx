import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleMobileMenu } from '../../redux/slices/uiSlice';
import {
  Sun,
  Moon,
  Laptop,
  Bell,
  Search,
  Bot,
  User,
  Settings,
  Menu,
  Shield,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlobalSearch } from '../dashboard/GlobalSearch';

export const TopNav: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const mobileMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-30 flex min-h-[72px] sm:min-h-[80px] w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-dark-bg-secondary/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      {/* Mobile Hamburger / Logo */}
      <div className="flex flex-none items-center gap-4">
        <button
          onClick={() => dispatch(toggleMobileMenu())}
          className="flex h-10 w-10 items-center justify-center rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="h-6 w-6 text-light-text-primary dark:text-dark-text-primary" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Shield className="h-7 w-7 text-primary-blue" />
        </Link>
      </div>

      {/* Global Search and Sync Feed trigger buttons */}
      <div className="hidden max-w-2xl flex-1 lg:px-8 px-4 sm:flex items-center gap-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="relative flex-1 h-10 flex items-center text-left rounded-input border border-gray-200 dark:border-gray-700 bg-light-bg-secondary dark:bg-dark-bg-primary hover:border-primary-blue dark:hover:border-primary-sky transition-colors px-4 gap-3 group"
          aria-label="Open threat search (Cmd+K)"
        >
          <Search className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted flex-none" aria-hidden="true" />
          <span className="flex-1 text-[15px] text-light-text-muted dark:text-dark-text-muted truncate">
            Search CVEs, indicators, threats…
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold text-light-text-muted border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded bg-gray-50 dark:bg-dark-bg-card ml-2 flex-none">
            ⌘K
          </span>
        </button>
        <button
          className="flex h-10 px-4 items-center justify-center rounded-button border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-secondary hover:bg-gray-50 dark:hover:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary transition-colors gap-2 font-medium text-[15px] flex-none"
          aria-label="Sync Threat Feed"
          title="Sync Feed"
        >
          <RefreshCw className="h-5 w-5" />
          <span className="hidden lg:inline">Sync Feed</span>
        </button>
      </div>

      {/* Action controls */}
      <div className="flex flex-none items-center gap-2 sm:gap-4">
        {/* AI Assistant shortcut */}
        <button
          disabled
          title="AI Assistant (Deferred)"
          className="flex h-10 w-10 items-center justify-center rounded-button text-light-text-muted dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 cursor-not-allowed transition-colors flex-none"
          aria-label="AI Assistant"
        >
          <Bot className="h-5 w-5" />
        </button>

        {/* Notifications Icon */}
        <div className="relative flex flex-none items-center">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-button text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="3 Unread Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-severity-critical border-2 border-white dark:border-dark-bg-secondary" />
          </button>
        </div>

        {/* Theme Switcher Toggle Dropdown */}
        <div className="relative flex flex-none items-center">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-button text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Change Color Theme"
            aria-haspopup="true"
            aria-expanded={themeDropdownOpen}
          >
            {theme === 'light' && <Sun className="h-5 w-5" />}
            {theme === 'dark' && <Moon className="h-5 w-5" />}
            {theme === 'system' && <Laptop className="h-5 w-5" />}
          </button>
          
          {themeDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-36 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-1 shadow-medium"
              onMouseLeave={() => setThemeDropdownOpen(false)}
            >
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setThemeDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs rounded-button capitalize transition-colors ${
                    theme === t
                      ? 'bg-primary-blue text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-primary dark:text-dark-text-primary'
                  }`}
                >
                  {t === 'light' && <Sun className="h-4 w-4" />}
                  {t === 'dark' && <Moon className="h-4 w-4" />}
                  {t === 'system' && <Laptop className="h-4 w-4" />}
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative flex-none pl-1 sm:pl-4 border-l border-gray-200 dark:border-gray-800 sm:ml-2">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary transition-colors text-left"
            aria-label="Open profile menu"
            aria-haspopup="true"
            aria-expanded={profileDropdownOpen}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-blue/20 text-primary-blue text-[15px] font-bold flex-none">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:flex flex-col flex-none">
              <span className="text-[14px] font-bold text-light-text-primary dark:text-dark-text-primary leading-tight">{user?.name || 'Analyst'}</span>
              <span className="text-[11px] font-semibold text-light-text-muted dark:text-dark-text-muted leading-tight uppercase tracking-wider mt-0.5">{user?.role || 'User'}</span>
            </div>
            <ChevronDown className="hidden h-4 w-4 sm:block text-light-text-muted dark:text-dark-text-muted flex-none ml-1" />
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 sm:w-72 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-1.5 shadow-large z-50 origin-top-right"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary break-words leading-tight">{user?.name}</p>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted truncate mt-1">{user?.email}</p>
                <div className="mt-2 flex">
                  <span className="inline-flex items-center px-2 py-0.5 bg-primary-blue/15 text-primary-blue rounded-badge text-[10px] font-bold uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-light-text-primary dark:text-dark-text-primary rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="h-4 w-4 text-light-text-muted dark:text-dark-text-muted" />
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-light-text-primary dark:text-dark-text-primary rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="h-4 w-4 text-light-text-muted dark:text-dark-text-muted" />
                Settings
              </Link>
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              <button
                onClick={() => {
                  logout();
                  setProfileDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-severity-critical rounded-button hover:bg-severity-critical/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Global Search modal — rendered outside header flow */}
    <GlobalSearch
      isOpen={searchOpen}
      onClose={() => setSearchOpen(false)}
    />
  </>
  );
};
