import React, { useState } from 'react';
import { X, FileText, Globe, Layers, ShieldCheck, Cpu } from 'lucide-react';
import type { ReportType } from '../../types/settings.types';

interface ReportGeneratorProps {
  onGenerate: (name: string, type: ReportType) => void;
  onClose: () => void;
}

interface TemplateOption {
  type: ReportType;
  label: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}

const TEMPLATES: TemplateOption[] = [
  { type: 'executive',     label: 'Executive Threat Report', icon: ShieldCheck, description: 'Strategic cyber risk summaries suitable for CISO and senior management briefings.' },
  { type: 'threat-intel',   label: 'Threat Intelligence Briefing', icon: Globe,       description: 'Deep dive into active threat campaigns, actors, TTPs, and infrastructure.' },
  { type: 'daily-soc',      label: 'Daily SOC Briefing',      icon: Cpu,         description: 'Operational summary of security alerts triaged, logs, and system metrics.' },
  { type: 'weekly',         label: 'Weekly Threat Digest',    icon: Layers,      description: 'Weekly cyber threat landscape trends and cumulative statistical logs.' },
  { type: 'ioc',            label: 'IOC Intelligence Export', icon: FileText,    description: 'Bulk indicators of compromise, registry modification keys, and C2 nodes.' },
];

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onGenerate, onClose }) => {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<ReportType>('executive');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onGenerate(name.trim(), selectedType);
    onClose();
  };

  return (
    <div className="rounded-card border border-gray-250 dark:border-gray-800 bg-white dark:bg-dark-bg-card shadow-medium overflow-hidden" role="dialog" aria-label="Compile New Report">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
          Compile Threat Briefing Report
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-hover text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          aria-label="Close generator console"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Report Name */}
        <div className="space-y-1.5">
          <label htmlFor="report-name" className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">
            Report Name
          </label>
          <input
            id="report-name"
            type="text"
            required
            placeholder="e.g. Q3 Executive Vulnerability Overview"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary-blue dark:focus:border-primary-sky"
          />
        </div>

        {/* Selection Grid */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-light-text-muted block">
            Select Report Template
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              const isSelected = selectedType === tmpl.type;
              return (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => setSelectedType(tmpl.type)}
                  className={`text-left p-3 rounded-card border transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-blue dark:border-primary-sky bg-primary-blue/5 dark:bg-primary-sky/5 shadow-small'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'
                  }`}
                >
                  <div className="flex gap-2">
                    <Icon className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${isSelected ? 'text-primary-blue dark:text-primary-sky' : 'text-light-text-muted'}`} />
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-primary-blue dark:text-primary-sky' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                        {tmpl.label}
                      </h4>
                      <p className="text-[10px] text-light-text-muted mt-0.5 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-button border border-gray-250 dark:border-gray-700 text-light-text-primary dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-5 py-2 text-xs font-bold rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors disabled:opacity-50"
          >
            Compile Report
          </button>
        </div>
      </form>
    </div>
  );
};
export default ReportGenerator;
