import type { Config } from 'tailwindcss'

// Design system — identidade "O Arquivo" — ver DESIGN.md.
// As cores apontam para CSS vars definidas em src/index.css.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        'paper-line': 'var(--paper-line)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-deep': 'var(--accent-deep)',
        'accent-soft': 'var(--accent-soft)',
        'accent-2': 'var(--accent-2)',
        cabinet: 'var(--cabinet)',
        'cabinet-dark': 'var(--cabinet-dark)',
        manila: 'var(--manila)',
        'manila-dark': 'var(--manila-dark)',
        'manila-deep': 'var(--manila-deep)',
        secret: 'var(--secret)',
        'secret-dark': 'var(--secret-dark)',
        'secret-text': 'var(--secret-text)',
        'secret-red': 'var(--secret-red)',
        success: 'var(--success)',
        'success-soft': 'var(--success-soft)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"Courier Prime"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        card: '7px', // pastas, modais, dropzone
        input: '4px', // inputs, botões, etiquetas
        tab: '7px 7px 0 0', // abas de pasta/fichário
        pill: '9999px', // legado — some ao fim da migração visual
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        hard: 'var(--shadow-hard)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--ease-out)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'stamp-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) rotate(-10deg) scale(2.4)' },
          '60%': { opacity: '1', transform: 'translate(-50%, -50%) rotate(-10deg) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -50%) rotate(-10deg) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms var(--ease-out)',
        'scale-in': 'scale-in 200ms var(--ease-out)',
        'slide-up': 'slide-up 200ms var(--ease-out)',
        shimmer: 'shimmer 1.6s linear infinite',
        'stamp-in': 'stamp-in 380ms cubic-bezier(0.34, 1.4, 0.64, 1) forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
