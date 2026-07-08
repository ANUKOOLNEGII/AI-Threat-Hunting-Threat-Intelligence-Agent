import React, { useEffect, useState } from 'react';
import { Sliders, Cpu, Save, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { AIConfig } from '../../types/admin.types';
import { PageHeader } from '../../components/ui/States';
import { useToast } from '../../contexts/ToastContext';

export const AIConfigurationPage: React.FC = () => {
  const { toast } = useToast();
  
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getAIConfig().then((data) => {
      setConfig(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load AI parameters configuration.');
      setLoading(false);
    });
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    try {
      const updated = await adminService.updateAIConfig(config);
      setConfig(updated);
      toast.success('AI Analyst configuration changes saved.');
    } catch {
      toast.error('Failed to update AI model parameters.');
    } finally {
      setSaving(false);
    }
  };

  const handleSliderChange = (key: keyof AIConfig, val: number) => {
    if (!config) return;
    setConfig({
      ...config,
      [key]: val
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center" aria-busy="true">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-light-text-muted" />
        <p className="text-xs text-light-text-muted mt-2">Loading configuration specifications...</p>
      </div>
    );
  }

  if (!config) return null;

  return (
    <main className="space-y-6 px-4 py-6 max-w-2xl mx-auto">
      <PageHeader
        title="AI Intelligence Configurator"
        subtitle="Manage models, temperatures, exfiltration parameters, and confidence filters."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Spec Card */}
        <div className="p-6 rounded-card border border-gray-255 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
            AI Target Model Specification
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="ai-provider" className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">
                  Model Provider
                </label>
                <select
                  id="ai-provider"
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none"
                >
                  <option value="gemini">Google Cloud Vertex AI</option>
                  <option value="openai">OpenAI Enterprise</option>
                  <option value="anthropic">Anthropic Claude</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="ai-model" className="text-[10px] font-black uppercase tracking-wider text-light-text-muted">
                  Active Model
                </label>
                <select
                  id="ai-model"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-field text-light-text-primary dark:text-dark-text-primary focus:outline-none"
                >
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gpt-4o">GPT-4o (Standard)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sliders Console parameters */}
        <div className="p-6 rounded-card border border-gray-255 dark:border-gray-800 bg-white dark:bg-dark-bg-card space-y-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-primary-blue dark:text-primary-sky" />
            Parameter Configurations
          </h3>

          <div className="space-y-4">
            {/* Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="ai-temperature" className="font-bold text-light-text-primary dark:text-dark-text-primary">Temperature</label>
                <span className="font-mono text-[11px] bg-gray-100 dark:bg-gray-850 px-1.5 py-0.5 rounded">{config.temperature}</span>
              </div>
              <input
                id="ai-temperature"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature}
                onChange={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-blue dark:accent-primary-sky"
              />
            </div>

            {/* Retrieval Depth */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="ai-depth" className="font-bold text-light-text-primary dark:text-dark-text-primary">RAG Vector Depth</label>
                <span className="font-mono text-[11px] bg-gray-100 dark:bg-gray-850 px-1.5 py-0.5 rounded">{config.retrievalDepth} sources</span>
              </div>
              <input
                id="ai-depth"
                type="range"
                min="1"
                max="10"
                step="1"
                value={config.retrievalDepth}
                onChange={(e) => handleSliderChange('retrievalDepth', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-blue dark:accent-primary-sky"
              />
            </div>

            {/* Confidence Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="ai-threshold" className="font-bold text-light-text-primary dark:text-dark-text-primary">Response Confidence Filter</label>
                <span className="font-mono text-[11px] bg-gray-100 dark:bg-gray-855 px-1.5 py-0.5 rounded">{config.confidenceThreshold}%</span>
              </div>
              <input
                id="ai-threshold"
                type="range"
                min="50"
                max="90"
                step="5"
                value={config.confidenceThreshold}
                onChange={(e) => handleSliderChange('confidenceThreshold', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-blue dark:accent-primary-sky"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-button bg-primary-blue dark:bg-primary-sky text-white dark:text-dark-bg-primary hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Specs...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </main>
  );
};
export default AIConfigurationPage;
