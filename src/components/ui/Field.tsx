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
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-2">{hint}</p>
      ) : null}
    </div>
  )
}
