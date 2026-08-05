import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '../../lib/gsap'

interface ToastItem {
  id: number
  message: string
}

interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// Toasts: canto inferior direito, 2.5s (seção 7 da spec). Cada item cuida
// da própria animação de saída (fade + desce) antes de sair do array —
// diferente de sumir instantâneo como antes.
function ToastEntry({ toast, onDone }: { toast: ToastItem; onDone: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.from(ref.current, { opacity: 0, y: 12, duration: 0.2, ease: 'power2.out' })
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (prefersReducedMotion()) {
        onDone(toast.id)
        return
      }
      gsap.to(ref.current, {
        opacity: 0,
        y: 8,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => onDone(toast.id),
      })
    }, 2500)
    return () => clearTimeout(timeout)
  }, [toast.id, onDone])

  return (
    <div
      ref={ref}
      role="status"
      className="rounded-input border-[1.5px] border-text border-l-[6px] border-l-accent bg-surface px-[18px] py-3 font-mono text-[13px] font-bold text-text shadow-hard"
    >
      {toast.message}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const showToast = useCallback((message: string) => {
    const id = nextId.current++
    setToasts((current) => [...current, { id, message }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {toasts.map((toast) => (
          <ToastEntry key={toast.id} toast={toast} onDone={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>.')
  return ctx
}
