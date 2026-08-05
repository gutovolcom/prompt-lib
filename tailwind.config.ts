import type { Config } from 'tailwindcss'

// Design system — identidade "O Arquivo" — ver DESIGN.md.
// As cores apontam para CSS vars "R G B" definidas em src/index.css.
// withOpacity permite usar modificadores de opacidade (ex.: bg-surface/50)
// em cima dessas vars — ver https://tailwindcss.com/docs/customizing-colors#using-css-variables.
function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: withOpacity('--bg'),
        surface: withOpacity('--surface'),
        'surface-2': withOpacity('--surface-2'),
        'surface-3': withOpacity('--surface-3'),
        border: withOpacity('--border'),
        'paper-line': withOpacity('--paper-line'),
        text: withOpacity('--text'),
        'text-2': withOpacity('--text-2'),
        'text-muted': withOpacity('--text-muted'),
        accent: withOpacity('--accent'),
        'accent-hover': withOpacity('--accent-hover'),
        'accent-deep': withOpacity('--accent-deep'),
        'accent-soft': withOpacity('--accent-soft'),
        'accent-2': withOpacity('--accent-2'),
        cabinet: withOpacity('--cabinet'),
        'cabinet-dark': withOpacity('--cabinet-dark'),
        manila: withOpacity('--manila'),
        'manila-dark': withOpacity('--manila-dark'),
        'manila-deep': withOpacity('--manila-deep'),
        secret: withOpacity('--secret'),
        'secret-dark': withOpacity('--secret-dark'),
        'secret-text': withOpacity('--secret-text'),
        'secret-red': withOpacity('--secret-red'),
        success: withOpacity('--success'),
        'success-soft': withOpacity('--success-soft'),
        danger: withOpacity('--danger'),
        'danger-soft': withOpacity('--danger-soft'),
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
