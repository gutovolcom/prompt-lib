import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-text-2">{label}</span>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-2">{hint}</p>
      ) : null}
    </div>
  )
}
