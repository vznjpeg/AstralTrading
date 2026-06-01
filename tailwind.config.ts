import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d8ff',
          300: '#a4b7ff',
          400: '#7c8eff',
          500: '#6366f1', // indigo-500
          600: '#4f46e5', // indigo-600
          700: '#4338ca', // indigo-700
          800: '#3730a3', // indigo-800
          900: '#312e81', // indigo-900
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c', // orange-400
          500: '#f97316', // orange-500
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
