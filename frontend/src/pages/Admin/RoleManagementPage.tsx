import React, { useState } from 'react';
import { Check, X, Shield as ShieldIcon } from 'lucide-react';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

interface PermissionSpec {
  key: string;
  label: string;
  description: string;
}

interface RolePermMap {
  admin: boolean;
  'soc-manager': boolean;
  analyst: boolean;
  researcher: boolean;
  executive: boolean;
}

export const RoleManagementPage: React.FC = () => {
  const { toast } = useToast();
  
  const permissions: PermissionSpec[] = [
    { key: 'read_threat_intel',  label: 'Read Threat Intel',  description: 'Access threat feeds, details, CVEs, and phishing logs.' },
    { key: 'write_threat_intel', label: 'Write Threat Intel', description: 'Modify feed entries, correlation maps, and custom markers.' },
    { key: 'run_ai_analyst',     label: 'Execute AI Analyst',  description: 'Send custom prompts and generate correlation summaries.' },
    { key: 'export_reports',     label: 'Export Reports',     description: 'Generate PDF/Markdown files of briefings.' },
    { key: 'manage_users',       label: 'Manage User Registries',description: 'Create user access tokens, modify roles, disable profiles.' },
    { key: 'configure_system',   label: 'Configure Platform',  description: 'Adjust database targets, rate limits, and scheduling intervals.' },
  ];

  const [matrix, setMatrix] = useState<Record<string, RolePermMap>>({
    read_threat_intel:  { admin: true,  'soc-manager': true,  analyst: true,  researcher: true,  executive: true },
    write_threat_intel: { admin: true,  'soc-manager': true,  analyst: true,  researcher: false, executive: false },
    run_ai_analyst:     { admin: true,  'soc-manager': true,  analyst: true,  researcher: true,  executive: false },
    export_reports:     { admin: true,  'soc-manager': true,  analyst: true,  researcher: false, executive: true },
    manage_users:       { admin: true,  'soc-manager': true,  analyst: false, researcher: false, executive: false },
    configure_system:   { admin: true,  'soc-manager': false, analyst: false, researcher: false, executive: false },
  });

  const togglePermission = (permKey: string, role: keyof RolePermMap) => {
    setMatrix((prev) => {
      const updated = {
        ...prev,
        [permKey]: {
          ...prev[permKey],
          [role]: !prev[permKey][role]
        }
      };
      toast.success('System permission matrix adjusted.');
      return updated;
    });
  };

  return (
    <main className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Role & Privilege Matrices"
        subtitle="Manage clearances, security rules, and user capabilities mapping."
      />

      <section className="p-6 rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2">
          <ShieldIcon className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
          Clearance Capabilities Mapping
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 border border-gray-150 dark:border-gray-850 rounded-card overflow-hidden" aria-label="Privilege parameters catalog">
            <thead className="bg-gray-50 dark:bg-dark-bg-secondary text-[10px] font-black uppercase tracking-wider text-light-text-muted text-left">
              <tr>
                <th scope="col" className="px-4 py-3.5 w-1/3">Permission Specification</th>
                <th scope="col" className="px-4 py-3.5 text-center">Administrator</th>
                <th scope="col" className="px-4 py-3.5 text-center">SOC Manager</th>
                <th scope="col" className="px-4 py-3.5 text-center">Security Analyst</th>
                <th scope="col" className="px-4 py-3.5 text-center">Threat Researcher</th>
                <th scope="col" className="px-4 py-3.5 text-center">Executive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-xs text-light-text-primary dark:text-dark-text-primary">
              {permissions.map((perm) => (
                <tr key={perm.key} className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover">
                  <td className="px-4 py-3.5">
                    <p className="font-bold">{perm.label}</p>
                    <span className="text-[10px] text-light-text-muted leading-relaxed block">{perm.description}</span>
                  </td>
                  
                  {(['admin', 'soc-manager', 'analyst', 'researcher', 'executive'] as const).map((role) => {
                    const hasAccess = matrix[perm.key]?.[role];
                    return (
                      <td key={role} className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(perm.key, role)}
                          className={`p-1.5 rounded transition-all ${
                            hasAccess
                              ? 'bg-positive-bg text-positive hover:bg-positive/20'
                              : 'bg-severity-critical/10 text-severity-critical hover:bg-severity-critical/20'
                          }`}
                          aria-label={`Toggle ${perm.label} for ${role}`}
                          aria-pressed={hasAccess}
                        >
                          {hasAccess ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
export default RoleManagementPage;
