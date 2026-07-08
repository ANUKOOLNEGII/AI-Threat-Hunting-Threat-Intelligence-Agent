import React, { useEffect, useState } from 'react';
import { UserPlus, Search, UserCheck, UserX, Key, Trash2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { AdminUser, UserStatus, UserRole } from '../../types/admin.types';
import { TableSkeleton } from '../../components/admin/AdminSkeletons';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

export const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load system user database.');
      setLoading(false);
    });
  }, [toast]);

  const handleToggleStatus = async (id: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const updated = await adminService.updateUserStatus(id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(`User status updated to ${nextStatus}.`);
    } catch {
      toast.error('Failed to update user authorization status.');
    }
  };

  const handleRoleChange = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success(`User role adjusted to ${role}.`);
  };

  const filtered = users.filter((u) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="User Management"
        subtitle="Manage analyst directory specifications, access privileges, and account locks."
        action={
          <button
            disabled
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-button bg-gray-50 dark:bg-dark-bg-secondary text-light-text-muted cursor-not-allowed border border-gray-250 dark:border-gray-700 opacity-60"
            title="Create user — Phase 11"
          >
            <UserPlus className="h-4 w-4" />
            Add User (Disabled)
          </button>
        }
      />

      {/* Filter panel */}
      <section className="p-4 rounded-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg-card flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none"
          />
        </div>
      </section>

      {/* Data Table */}
      <section>
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-800 rounded-card bg-white dark:bg-dark-bg-card">
            <p className="text-xs text-light-text-muted">No users found matching search parameters.</p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-card overflow-hidden bg-white dark:bg-dark-bg-card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800" aria-label="Analyst users register">
                <thead className="bg-gray-50 dark:bg-dark-bg-secondary text-[10px] font-black uppercase tracking-wider text-light-text-muted text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3">User Details</th>
                    <th scope="col" className="px-4 py-3">Clearance Role</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Telemetry Activity</th>
                    <th scope="col" className="px-4 py-3">Last Access</th>
                    <th scope="col" className="px-4 py-3 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-xs text-light-text-primary dark:text-dark-text-primary">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover">
                      <td className="px-4 py-3.5">
                        <p className="font-bold">{user.name}</p>
                        <span className="text-[10px] text-light-text-muted">{user.email}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="bg-transparent border-none text-xs font-bold text-primary-blue dark:text-primary-sky focus:outline-none p-0 cursor-pointer"
                        >
                          <option value="admin">Administrator</option>
                          <option value="soc-manager">SOC Manager</option>
                          <option value="analyst">Security Analyst</option>
                          <option value="researcher">Threat Researcher</option>
                          <option value="executive">Executive</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          user.status === 'active'
                            ? 'bg-positive-bg text-positive border-positive/30'
                            : 'bg-severity-critical/10 text-severity-critical border-severity-critical/30'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {user.activityCount} actions
                      </td>
                      <td className="px-4 py-3.5 text-light-text-muted text-[10px]">
                        {new Date(user.lastLogin).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover ${
                            user.status === 'active' ? 'text-severity-critical' : 'text-positive'
                          }`}
                          title={user.status === 'active' ? 'Lock user account' : 'Authorize account'}
                        >
                          {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        
                        <button
                          disabled
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-bg-hover text-light-text-muted opacity-45 cursor-not-allowed"
                          title="Reset credential (disabled)"
                        >
                          <Key className="h-4 w-4" />
                        </button>

                        <button
                          disabled
                          className="p-1.5 rounded hover:bg-severity-critical/15 text-light-text-muted opacity-45 cursor-not-allowed"
                          title="Delete registry (disabled)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
export default UserManagementPage;
