import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Check, Copy } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useGSAP } from '@gsap/react'
import { supabase } from '../../lib/supabase'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { useToast } from '../ui/Toast'

interface CopyButtonProps {
  promptId: string
  promptText: string
  size?: 'sm' | 'lg' | 'icon'
}

// Ícone Copy/Check com um pequeno "pop" ao trocar de estado — a troca de
// `key` força o remount, o que já dispara a entrada configurada no useGSAP.
function SwapIcon({ copied, size }: { copied: boolean; size: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.fromTo(
      ref.current,
      { scale: 0.5, rotate: -30, opacity: 0 },
      { scale: 1, rotate: 0, opacity: 1, duration: 0.25, ease: 'back.out(2)' },
    )
  }, [])

  return (
    <span key={copied ? 'check' : 'copy'} ref={ref} className="inline-flex">
      {copied ? <Check size={size} aria-hidden /> : <Copy size={size} aria-hidden />}
    </span>
  )
}

// Ação nº 1 do produto: copiar o prompt (clipboard + toast + RPC de contagem).
// copy_count NUNCA é atualizado direto pelo client (regra 4 da seção 8).
export function CopyButton({ promptId, promptText, size = 'sm' }: CopyButtonProps) {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  async function handleCopy(event: MouseEvent) {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(promptText)
    } catch {
      showToast('Não foi possível copiar. Copie manualmente pelo detalhe.')
      return
    }
    showToast('Prompt copiado')
    setCopied(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    const { error } = await supabase.rpc('increment_copy_count', { p_prompt_id: promptId })
    if (!error) {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
    }
  }

  if (size === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title="Copiar prompt"
        aria-label="Copiar prompt"
        className={`flex h-9 w-9 items-center justify-center rounded-pill shadow-md backdrop-blur-sm transition duration-150 ${
          copied ? 'bg-success text-white' : 'bg-surface/90 text-text hover:bg-surface'
        }`}
      >
        <SwapIcon copied={copied} size={15} />
      </button>
    )
  }

  const sizeClasses = size === 'lg' ? 'w-full px-4 py-2.5 text-sm' : 'px-3 py-1.5 text-xs'

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-1.5 rounded-pill font-semibold text-white transition duration-150 ${
        copied ? 'bg-success' : 'bg-accent hover:bg-accent-hover'
      } ${sizeClasses}`}
    >
      <SwapIcon copied={copied} size={size === 'lg' ? 16 : 13} />
      {copied ? 'Copiado!' : 'Copiar prompt'}
    </button>
  )
}
