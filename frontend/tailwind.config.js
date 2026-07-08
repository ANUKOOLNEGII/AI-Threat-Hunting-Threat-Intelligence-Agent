/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enterprise/Brand colors
        primary: {
          blue: '#2563EB',
          navy: '#0F172A',
          sky: '#38BDF8',
          cyan: '#06B6D4',
        },
        // Severity levels
        severity: {
          critical: '#DC2626',
          high: '#EA580C',
          medium: '#F59E0B',
          low: '#22C55E',
          info: '#3B82F6',
        },
        // Theme surfaces (Dark mode default)
        dark: {
          bg: {
            primary: '#020617',
            secondary: '#0F172A',
            card: '#1E293B',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#CBD5E1',
            muted: '#64748B',
            caption: '#94A3B8',
          }
        },
        light: {
          bg: {
            primary: '#FFFFFF',
            secondary: '#F8FAFC',
            card: '#E2E8F0',
          },
          text: {
            primary: '#0F172A',
            secondary: '#334155',
            muted: '#64748B',
            caption: '#94A3B8',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px',
        '96': '96px',
      },
      borderRadius: {
        'button': '8px',
        'card': '12px',
        'modal': '16px',
        'input': '8px',
        'badge': '999px',
      },
      boxShadow: {
        'small': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 8px rgba(0, 0, 0, 0.15)',
        'large': '0 8px 20px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'slide-out': 'slideOut 0.2s ease-out',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        ripple: {
          'to': { transform: 'scale(4)', opacity: '0' },
        }
      },
    },
  },
  plugins: [],
}
