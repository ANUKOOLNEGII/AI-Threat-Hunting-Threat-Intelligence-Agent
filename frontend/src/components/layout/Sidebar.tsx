import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { toggleMobileMenu } from '../../redux/slices/uiSlice';
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

// Enterprise optimized fixed width: 270px
const SIDEBAR_WIDTH = 'w-[270px]';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const mobileMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen);
  const { hasRole, logout } = useAuth();

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

  const filteredItems = menuItems.filter((item) => {
    return !item.roles || hasRole(item.roles);
  });

  return (
    <>
      {/* Mobile Sidebar overlay backdrop — shown on mobile/tablet when sidebar drawer is active */}
      {mobileMenuOpen && (
        <div
          onClick={() => dispatch(toggleMobileMenu())}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Sidebar Navigation"
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r border-gray-200 dark:border-gray-800
          bg-light-bg-secondary dark:bg-dark-bg-secondary
          text-light-text-primary dark:text-dark-text-primary
          transition-transform duration-300 ease-in-out
          transform lg:transform-none lg:relative lg:inset-auto lg:z-auto
          ${SIDEBAR_WIDTH}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ─── Brand / Logo Area ─────────────────────────────────────── */}
        <div
          className="
            flex flex-none min-h-[72px] sm:min-h-[80px] items-center border-b
            border-gray-200 dark:border-gray-800
            bg-white/95 dark:bg-dark-bg-secondary/95 backdrop-blur-xl
            px-4 justify-between
          "
        >
          <div className="flex items-center gap-3 min-w-0">
            <ShieldIcon className="h-6 w-6 text-primary-blue dark:text-primary-sky flex-none" />
            <span className="font-sans text-[15px] font-bold tracking-widest text-primary-blue dark:text-primary-sky whitespace-nowrap select-none">
              AEGIS MONITOR
            </span>
          </div>
        </div>

        {/* ─── Navigation Menu List ───────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto no-scrollbar py-3 px-3"
          aria-label="Primary Navigation"
        >
          <ul className="space-y-1.5 list-none m-0 p-0">
            {filteredItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (mobileMenuOpen) {
                        dispatch(toggleMobileMenu());
                      }
                    }}
                    className={({ isActive }) =>
                      `
                      flex items-center rounded-lg
                      transition-colors duration-150
                      gap-3 px-3 py-2 w-full min-h-[40px]
                      ${isActive
                        ? 'bg-primary-blue text-white shadow-sm'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-light-text-primary dark:hover:text-dark-text-primary'
                      }
                      `
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                    {item.badge && (
                      <span
                        className={`
                          ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0
                          ${item.badge === 'New'
                            ? 'bg-severity-low/20 text-severity-low'
                            : item.badge === 'AI'
                            ? 'bg-primary-sky/20 text-primary-sky'
                            : 'bg-primary-blue/20 text-primary-blue'
                          }
                        `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ─── Sidebar Footer / Logout ────────────────────────────────── */}
        <div className="flex-none border-t border-gray-200 dark:border-gray-800 px-3 py-3">
          <button
            onClick={logout}
            className="
              flex w-full items-center min-h-[40px] rounded-lg
              text-sm font-medium text-severity-critical
              hover:bg-severity-critical/10 transition-colors
              gap-3 px-3 py-2
            "
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
