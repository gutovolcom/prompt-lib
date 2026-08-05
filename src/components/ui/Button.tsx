import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'border-b-[3px] border-accent-deep bg-accent text-surface hover:brightness-105',
  secondary: 'border border-border bg-surface-2 text-text hover:bg-surface-3',
  outline: 'border border-text/30 bg-surface text-text hover:border-text',
  ghost: 'bg-transparent text-text-2 hover:bg-surface-2 hover:text-text',
  danger: 'border-b-[3px] border-accent-deep bg-accent text-surface hover:brightness-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-[13px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-input font-mono font-bold uppercase tracking-[0.06em] transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
}
