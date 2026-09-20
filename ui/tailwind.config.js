/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        border: 'var(--border-color)',
        accent: {
          cyan: '#00E5FF',
          emerald: '#10B981',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          rose: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
