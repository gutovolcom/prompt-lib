import { useId, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-text-2">
        {label}
      </label>
      <textarea
        id={id}
        className={`rounded-input border border-border bg-surface-2 px-4 py-3 text-sm leading-relaxed text-text placeholder:text-text-muted transition duration-150 focus:border-accent focus:bg-surface focus:outline-none ${className}`}
        {...props}
      />
    </div>
  )
}
