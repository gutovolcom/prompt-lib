import type { ReactNode } from 'react'

type Variant = 'neutral' | 'accent' | 'dark'

interface BadgeProps {
  children: ReactNode
  /** Cor de fundo (hex vindo de categories.color). Sem cor = usa `variant`. */
  color?: string
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  neutral: 'bg-surface-2 text-text-2',
  accent: 'bg-accent-soft text-accent',
  dark: 'bg-text text-white',
}

export function Badge({ children, color, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium ${
        color ? '' : variantClasses[variant]
      }`}
      style={color ? { backgroundColor: color, color: '#fff' } : undefined}
    >
      {children}
    </span>
  )
}
