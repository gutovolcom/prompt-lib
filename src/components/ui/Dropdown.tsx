import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '../../lib/gsap'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  'aria-label': string
  className?: string
}

// Dropdown customizado no padrão "O Arquivo" (trigger + listbox flutuante),
// usado nos filtros da galeria no lugar do <select> nativo — cujo menu
// aberto não aceita estilização. Foco permanece no trigger (collapsed
// listbox com aria-activedescendant).
export function Dropdown({ value, options, onChange, 'aria-label': ariaLabel, className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxId = useId()

  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useGSAP(
    () => {
      const menu = menuRef.current
      if (!menu || !open || prefersReducedMotion()) return
      gsap.fromTo(menu, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' })
    },
    { dependencies: [open] },
  )

  function openMenu() {
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)))
    setOpen(true)
  }

  function select(option: DropdownOption) {
    onChange(option.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        openMenu()
      }
      return
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(options.length - 1)
        break
      case 'Enter':
      case ' ': {
        e.preventDefault()
        const active = options[activeIndex]
        if (active) select(active)
        break
      }
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`flex items-center gap-2 whitespace-nowrap rounded-input border border-border bg-surface px-3.5 py-[7px] font-mono text-xs uppercase tracking-[0.06em] transition duration-150 ${
          open ? 'border-text text-text' : 'text-text-2 hover:border-text hover:text-text'
        }`}
      >
        {selected?.label ?? ariaLabel}
        <ChevronDown
          size={13}
          aria-hidden
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-64 min-w-full overflow-y-auto rounded-input border border-border bg-surface py-1 shadow-md"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex
            return (
              <li
                key={option.value}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => select(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 whitespace-nowrap px-3.5 py-2 font-mono text-xs uppercase tracking-[0.06em] ${
                  isSelected ? 'text-accent' : isActive ? 'text-text' : 'text-text-2'
                } ${isActive ? 'bg-surface-2' : ''}`}
              >
                {option.label}
                {isSelected && <Check size={12} aria-hidden />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
