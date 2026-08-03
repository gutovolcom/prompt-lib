import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useToast } from '../components/ui/Toast'

// Favoritar é idempotente e otimista na UI, com rollback em erro
// (regra 5 da seção 8 da spec).

export function useFavoriteIds() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  return useQuery({
    queryKey: ['favorites', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('favorites')
        .select('prompt_id')
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
      return (data as { prompt_id: string }[]).map((row) => row.prompt_id)
    },
  })
}

export function useToggleFavorite() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ promptId, next }: { promptId: string; next: boolean }) => {
      if (next) {
        // upsert com ignoreDuplicates = idempotente
        const { error } = await supabase
          .from('favorites')
          .upsert(
            { user_id: userId, prompt_id: promptId },
            { onConflict: 'user_id,prompt_id', ignoreDuplicates: true },
          )
        if (error) throw new Error(error.message)
      } else {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: userId, prompt_id: promptId })
        if (error) throw new Error(error.message)
      }
    },
    onMutate: async ({ promptId, next }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', userId] })
      const previous = queryClient.getQueryData<string[]>(['favorites', userId])
      queryClient.setQueryData<string[]>(['favorites', userId], (current = []) =>
        next ? [...new Set([...current, promptId])] : current.filter((id) => id !== promptId),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites', userId], context.previous)
      }
      showToast('Não foi possível atualizar o favorito.')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
      // Atualiza contadores no detalhe e a listagem filtrada por favoritos.
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
    },
  })
}
