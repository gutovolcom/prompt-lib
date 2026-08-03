import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  /** Cor de fundo (hex vindo de categories.color). Sem cor = badge neutro. */
  color?: string
}

export function Badge({ children, color }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-pill border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text"
      style={color ? { backgroundColor: color, borderColor: 'transparent', color: '#fff' } : undefined}
    >
      {children}
    </span>
  )
}
