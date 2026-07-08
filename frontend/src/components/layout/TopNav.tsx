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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-dark-bg-secondary/80 backdrop-blur-md px-4 sm:px-6">
      {/* Mobile Hamburger / Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleMobileMenu())}
          className="flex h-10 w-10 items-center justify-center rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="h-6 w-6 text-light-text-primary dark:text-dark-text-primary" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Shield className="h-6 w-6 text-primary-blue" />
        </Link>
      </div>

      {/* Global Search trigger button */}
      <div className="hidden max-w-md flex-1 px-4 md:block">
        <button
          onClick={() => setSearchOpen(true)}
          className="relative w-full flex items-center text-left rounded-input border border-gray-200 dark:border-gray-700 bg-light-bg-secondary dark:bg-dark-bg-primary hover:border-primary-blue dark:hover:border-primary-sky transition-colors px-3 py-1.5 gap-2 group"
          aria-label="Open threat search (Cmd+K)"
        >
          <Search className="h-4 w-4 text-light-text-muted dark:text-dark-text-muted" aria-hidden="true" />
          <span className="flex-1 text-sm text-light-text-muted dark:text-dark-text-muted">
            Search CVEs, indicators, threats…
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold text-light-text-muted border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded bg-gray-50 dark:bg-dark-bg-card">
            ⌘K
          </span>
        </button>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* AI Assistant shortcut */}
        <button
          disabled
          title="AI Assistant (Deferred)"
          className="flex h-9 w-9 items-center justify-center rounded-button text-light-text-muted dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 cursor-not-allowed"
          aria-label="AI Assistant"
        >
          <Bot className="h-5 w-5" />
        </button>

        {/* Notifications Icon (Placeholder) */}
        <div className="relative">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-button text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="3 Unread Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-severity-critical" />
          </button>
        </div>

        {/* Theme Switcher Toggle Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-button text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
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
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary"
            aria-label="Open profile menu"
            aria-haspopup="true"
            aria-expanded={profileDropdownOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-blue/20 text-primary-blue text-sm font-bold">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <span className="hidden text-xs font-semibold sm:block">{user?.name || 'Analyst'}</span>
            <ChevronDown className="hidden h-4 w-4 sm:block" />
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card p-1 shadow-medium"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">{user?.name}</p>
                <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted truncate">{user?.email}</p>
                <span className="mt-1 inline-block text-[9px] px-1.5 py-0.2 bg-primary-blue/15 text-primary-blue rounded-full font-semibold uppercase">
                  {user?.role}
                </span>
              </div>
              <Link
                to="/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-light-text-primary dark:text-dark-text-primary rounded-button hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-light-text-primary dark:text-dark-text-primary rounded-button hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  setProfileDropdownOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-severity-critical rounded-button hover:bg-severity-critical/10"
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
