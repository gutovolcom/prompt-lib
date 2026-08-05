import type { ReactNode } from 'react'

type Variant = 'neutral' | 'accent' | 'dark'

interface BadgeProps {
  children: ReactNode
  /** Cor de fundo (hex vindo de categories.color). Sem cor = usa `variant`. */
  color?: string
  variant?: Variant
}

// Etiquetas datilografadas — como carimbos de categoria numa ficha.
const variantClasses: Record<Variant, string> = {
  neutral: 'border border-border bg-surface-2 text-text-2',
  accent: 'border border-accent/30 bg-accent-soft text-accent',
  dark: 'border border-text/30 bg-surface text-text-2',
}

export function Badge({ children, color, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-input px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${
        color ? '' : variantClasses[variant]
      }`}
      style={color ? { backgroundColor: color, color: '#fff' } : undefined}
    >
      {children}
    </span>
  )
}
