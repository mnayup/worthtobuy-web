/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        card: '0 10px 25px -3px rgba(15, 23, 42, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.03)',
        glow: '0 10px 30px -4px rgba(244, 63, 94, 0.22)',
        'glow-indigo': '0 10px 30px -4px rgba(99, 102, 241, 0.22)',
        'glow-amber': '0 10px 30px -4px rgba(245, 158, 11, 0.22)',
        'glow-emerald': '0 10px 30px -4px rgba(16, 185, 129, 0.22)',
      },
      colors: {
        // Modern eye-friendly Slate foundation replacing drab muddy brown
        brand: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Energetic, cheerful Jastip Shopping Rose/Coral replacing brick red
        cherry: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        // Warm Sunshine Honey Amber for discounts, trip specials & highlights
        honey: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
        },
        // Additional vibrant accents for jastip operations
        jastip: {
          indigo: '#4F46E5',
          coral: '#F43F5E',
          teal: '#0D9488',
          sky: '#0284C7',
          amber: '#F59E0B',
          purple: '#7C3AED',
          emerald: '#10B981',
        },
      },
    },
  },
  plugins: [],
};
