import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category, PromptWithRelations } from '../lib/types'

const LIST_SELECT =
  '*, author:profiles(*), images:prompt_images(*), categories:prompt_categories(category:categories(*))'

const DETAIL_SELECT = `${LIST_SELECT}, favorites(count)`

function sortImages(prompt: PromptWithRelations): PromptWithRelations {
  return {
    ...prompt,
    images: [...prompt.images].sort((a, b) => a.sort_order - b.sort_order),
  }
}

// Listagem da galeria (Fase 2: lista simples por data; filtros, busca e
// infinite scroll chegam na Fase 3 via useInfiniteQuery).
export function usePrompts() {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: async (): Promise<PromptWithRelations[]> => {
      const { data, error } = await supabase
        .from('prompts')
        .select(LIST_SELECT)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return (data as unknown as PromptWithRelations[]).map(sortImages)
    },
  })
}

export function usePrompt(id: string | undefined) {
  return useQuery({
    queryKey: ['prompts', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<PromptWithRelations> => {
      const { data, error } = await supabase
        .from('prompts')
        .select(DETAIL_SELECT)
        .eq('id', id as string)
        .single()
      if (error) throw new Error(error.message)
      return sortImages(data as unknown as PromptWithRelations)
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw new Error(error.message)
      return data as Category[]
    },
  })
}
