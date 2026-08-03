import type { MouseEvent } from 'react'
import { Copy } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useToast } from '../ui/Toast'

interface CopyButtonProps {
  promptId: string
  promptText: string
  size?: 'sm' | 'lg'
}

// Ação nº 1 do produto: copiar o prompt (clipboard + toast + RPC de contagem).
// copy_count NUNCA é atualizado direto pelo client (regra 4 da seção 8).
export function CopyButton({ promptId, promptText, size = 'sm' }: CopyButtonProps) {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  async function handleCopy(event: MouseEvent) {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(promptText)
    } catch {
      showToast('Não foi possível copiar. Copie manualmente pelo detalhe.')
      return
    }
    showToast('Prompt copiado')
    const { error } = await supabase.rpc('increment_copy_count', { p_prompt_id: promptId })
    if (!error) {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
    }
  }

  const sizeClasses =
    size === 'lg' ? 'w-full px-4 py-2.5 text-sm' : 'px-3 py-1.5 text-xs'

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-1.5 rounded-input bg-accent font-medium text-white transition duration-150 hover:brightness-110 ${sizeClasses}`}
    >
      <Copy size={size === 'lg' ? 16 : 13} aria-hidden />
      Copiar prompt
    </button>
  )
}
