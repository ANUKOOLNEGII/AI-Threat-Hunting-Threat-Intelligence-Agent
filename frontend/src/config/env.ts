export interface AppConfig {
  env: 'development' | 'production' | 'test';
  apiUrl: string;
  defaultTheme: 'light' | 'dark' | 'system';
  featureFlags: {
    enableAiChat: boolean;
    enableReports: boolean;
    enableThreatFeed: boolean;
  };
}

// Simple environment validation
const getEnvVar = (key: string, defaultValue: string): string => {
  const val = import.meta.env[key];
  if (val === undefined || val === '') {
    return defaultValue;
  }
  return val;
};

export const config: AppConfig = {
  env: (import.meta.env.MODE as 'development' | 'production' | 'test') || 'development',
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:8000/api/v1'),
  defaultTheme: (getEnvVar('VITE_DEFAULT_THEME', 'dark') as 'light' | 'dark' | 'system'),
  featureFlags: {
    enableAiChat: getEnvVar('VITE_ENABLE_AI_CHAT', 'false') === 'true',
    enableReports: getEnvVar('VITE_ENABLE_REPORTS', 'false') === 'true',
    enableThreatFeed: getEnvVar('VITE_ENABLE_THREAT_FEED', 'false') === 'true',
  },
};

// Validate environment configurations
export const validateConfig = (): void => {
  if (config.env === 'production' && config.apiUrl.includes('localhost')) {
    console.warn('[CONFIG WARNING]: Production environment is configured to use a local API URL.');
  }
};
