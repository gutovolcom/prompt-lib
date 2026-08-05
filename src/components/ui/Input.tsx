import { useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-text-2">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-input border border-border bg-surface-2 px-4 py-2.5 text-sm text-text placeholder:text-text-muted transition duration-150 focus:border-accent focus:bg-surface focus:outline-none ${className}`}
        {...props}
      />
    </div>
  )
}
