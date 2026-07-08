import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip } from '../ui/Overlays';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Rss,
  Search,
  ShieldAlert,
  Hash,
  Bug,
  Lock,
  MailWarning,
  GitBranch,
  Users,
  Target,
  Bot,
  FileText,
  Bell,
  User,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield as ShieldIcon,
  Cpu,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: string;
  roles?: Array<'admin' | 'analyst' | 'viewer'>;
}

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const { hasRole, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Threat Feed', path: '/threat-feed', icon: Rss, badge: 'New' },
    { name: 'Threat Search', path: '/threat-search', icon: Search },
    { name: 'CVE Explorer', path: '/cve-explorer', icon: ShieldAlert },
    { name: 'IOC Explorer', path: '/ioc-explorer', icon: Hash },
    { name: 'Malware', path: '/malware', icon: Bug },
    { name: 'Ransomware', path: '/ransomware', icon: Lock },
    { name: 'Phishing', path: '/phishing', icon: MailWarning },
    { name: 'Threat Correlation', path: '/threat-correlation', icon: GitBranch },
    { name: 'Threat Actors', path: '/threat-actors', icon: Users },
    { name: 'MITRE ATT&CK', path: '/mitre-attack', icon: Target },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'AI' },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: '3' },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['admin', 'analyst'] },
    { name: 'Admin Console', path: '/admin', icon: ShieldIcon, roles: ['admin'] },
    { name: 'User Management', path: '/user-management', icon: Users, roles: ['admin'] },
    { name: 'Role Matrix', path: '/role-management', icon: ShieldIcon, roles: ['admin'] },
    { name: 'Background Jobs', path: '/scheduler', icon: Cpu, roles: ['admin'] },
    { name: 'AI Models', path: '/ai-configuration', icon: Bot, roles: ['admin'] },
    { name: 'Monitoring', path: '/monitoring', icon: SettingsIcon, roles: ['admin'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: FileText, roles: ['admin'] },
  ];

  // Filter items based on user role and search query
  const filteredItems = menuItems.filter((item) => {
    const roleAllowed = !item.roles || hasRole(item.roles);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return roleAllowed && matchesSearch;
  });

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } lg:static`}
    >
      {/* Brand area */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <span className="font-sans text-base font-bold tracking-wider text-primary-blue dark:text-primary-sky">
            AEGIS MONITOR
          </span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex h-8 w-8 items-center justify-center rounded-button hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Search box (only when expanded) */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-light-text-muted dark:text-dark-text-muted" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-input bg-white dark:bg-dark-bg-primary border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-blue"
            />
          </div>
        </div>
      )}

      {/* Navigation menu list */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3 no-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const navLink = (
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                  isActive
                    ? 'bg-primary-blue text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
              {!collapsed && item.badge && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  item.badge === 'New' 
                    ? 'bg-severity-low/20 text-severity-low' 
                    : item.badge === 'AI' 
                    ? 'bg-primary-sky/20 text-primary-sky' 
                    : 'bg-primary-blue/20 text-primary-blue'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} content={item.name} position="right">
                {navLink}
              </Tooltip>
            );
          }

          return (
            <div key={item.path}>
              {navLink}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer (Logout) */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-severity-critical rounded-button hover:bg-severity-critical/10 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
