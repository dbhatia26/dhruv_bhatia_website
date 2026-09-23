/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'card-glass',
    'fade-section',
    'fade-section.visible',
    'grid-bg',
    'gradient-text',
    'gradient-text-static',
    'tag',
    'noise',
    'ring-spin',
    'headshot-ring',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      // Running Tab's own design tokens. Values only resolve inside the
      // .running-tab wrapper (running-tab.css), so these utilities are inert
      // everywhere else in the site and safe to add to the shared config.
      colors: {
        rt: {
          bg: 'var(--rt-bg)',
          surface: 'var(--rt-surface)',
          'surface-raised': 'var(--rt-surface-raised)',
          border: 'var(--rt-border)',
          ink: {
            strong: 'var(--rt-ink-strong)',
            body: 'var(--rt-ink-body)',
            muted: 'var(--rt-ink-muted)',
            faint: 'var(--rt-ink-faint)',
          },
          gradient: {
            1: 'var(--rt-gradient-1)',
            2: 'var(--rt-gradient-2)',
            3: 'var(--rt-gradient-3)',
          },
          credit: 'var(--rt-credit)',
          'credit-soft': 'var(--rt-credit-soft)',
          'credit-border': 'var(--rt-credit-border)',
          debit: 'var(--rt-debit)',
          'debit-soft': 'var(--rt-debit-soft)',
          'debit-soft-hover': 'var(--rt-debit-soft-hover)',
          'debit-border': 'var(--rt-debit-border)',
          warn: 'var(--rt-warn)',
          'warn-soft': 'var(--rt-warn-soft)',
          'warn-border': 'var(--rt-warn-border)',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'ring-spin': 'ring-spin 4s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'ring-spin': {
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
