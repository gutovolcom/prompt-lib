import { useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  const id = useId()
  const select = (
    <div className="relative">
      <select
        id={label ? id : undefined}
        className={`appearance-none rounded-input border border-border bg-surface py-2 pl-4 pr-9 text-sm text-text transition duration-150 focus:border-accent focus:outline-none ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-2"
        aria-hidden
      />
    </div>
  )

  if (!label) return select

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-text-2">
        {label}
      </label>
      {select}
    </div>
  )
}
