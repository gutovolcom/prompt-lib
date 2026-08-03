import { useId, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      <textarea
        id={id}
        className={`rounded-input border border-transparent bg-surface-2 px-4 py-3 text-sm leading-relaxed text-text placeholder:text-text-muted transition duration-150 focus:border-accent focus:bg-surface focus:outline-none ${className}`}
        {...props}
      />
    </div>
  )
}
