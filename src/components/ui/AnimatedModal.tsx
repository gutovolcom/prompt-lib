import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '../../lib/gsap'

interface AnimatedModalProps {
  open: boolean
  /** Chamado uma vez, depois que a animação de saída termina (ex.: resetar
   * formulário só depois que o painel já não está mais visível). */
  onExited?: () => void
  role?: 'dialog' | 'alertdialog'
  ariaLabel?: string
  overlayClassName?: string
  panelClassName: string
  onBackdropClick?: () => void
  children: ReactNode
}

// Wrapper de modal puramente apresentacional: continua montado por ~150ms
// depois que `open` vira false para tocar a animação de saída, e só então
// para de renderizar. Não carrega lógica de negócio — quem chama decide
// quando fechar (setState, navigate etc.), este componente só atrasa o
// desmonte visual até a saída terminar.
export function AnimatedModal({
  open,
  onExited,
  role = 'dialog',
  ariaLabel,
  overlayClassName = 'fixed inset-0 z-40 flex items-center justify-center p-4',
  panelClassName,
  onBackdropClick,
  children,
}: AnimatedModalProps) {
  const [mounted, setMounted] = useState(open)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    if (!mounted) return
    if (prefersReducedMotion()) {
      setMounted(false)
      onExited?.()
      return
    }
    const tl = gsap.timeline({
      onComplete: () => {
        setMounted(false)
        onExited?.()
      },
    })
    tl.to(panelRef.current, { opacity: 0, scale: 0.96, y: 8, duration: 0.15, ease: 'power2.in' }).to(
      backdropRef.current,
      { opacity: 0, duration: 0.15, ease: 'power2.in' },
      '<',
    )
    return () => {
      tl.kill()
    }
    // mounted/onExited só são lidos, não devem re-disparar a saída sozinhos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useGSAP(
    () => {
      if (!mounted || !open || prefersReducedMotion()) return
      gsap.set(backdropRef.current, { opacity: 0 })
      gsap.set(panelRef.current, { opacity: 0, scale: 0.96, y: 8 })
      gsap
        .timeline()
        .to(backdropRef.current, { opacity: 1, duration: 0.2, ease: 'power2.out' })
        .to(panelRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power2.out' }, '<')
    },
    { dependencies: [mounted, open] },
  )

  if (!mounted) return null

  return (
    <div className={overlayClassName} role={role} aria-modal="true" aria-label={ariaLabel}>
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[var(--overlay)]"
        onClick={onBackdropClick}
      />
      <div ref={panelRef} className={`relative z-10 ${panelClassName}`}>
        {children}
      </div>
    </div>
  )
}
