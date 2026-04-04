import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design system — always reference these by name, not raw hex
        brand: {
          bg:      '#0A0C10',
          surface: '#131720',
          border:  '#1E2433',
          accent:  '#6C63FF',
          'accent-dim': '#3D3880',
          text:    '#F2F2F5',
          muted:   '#6B7280',
        },
      },
      fontFamily: {
        sans:  ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        syne:  ['var(--font-syne)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-jetbrains-mono)', 'monospace'],
        serif: ['var(--font-instrument-serif)', 'serif'],
      },
      keyframes: {
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'flip-out': {
          '0%':   { transform: 'rotateX(0deg)'    },
          '100%': { transform: 'rotateX(-90deg)'  },
        },
        'flip-in': {
          '0%':   { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0deg)'  },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108,99,255,0)' },
          '50%':      { boxShadow: '0 0 24px 4px rgba(108,99,255,0.25)' },
        },
      },
      animation: {
        'slide-up':   'slide-up 0.5s ease forwards',
        'fade-in':    'fade-in 0.4s ease forwards',
        'flip-out':   'flip-out 0.15s ease-in forwards',
        'flip-in':    'flip-in 0.15s ease-out forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
