import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Check, Copy } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useToast } from '../ui/Toast'

interface CopyButtonProps {
  promptId: string
  promptText: string
  size?: 'sm' | 'lg' | 'icon'
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
        {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
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
      {copied ? (
        <>
          <Check size={size === 'lg' ? 16 : 13} aria-hidden />
          Copiado!
        </>
      ) : (
        <>
          <Copy size={size === 'lg' ? 16 : 13} aria-hidden />
          Copiar prompt
        </>
      )}
    </button>
  )
}
