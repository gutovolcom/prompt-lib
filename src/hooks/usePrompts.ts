import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category, Profile, PromptWithRelations } from '../lib/types'
import type { PromptFilters } from './useFilters'
import { useAuth } from './useAuth'

export const PAGE_SIZE = 30

const AUTHOR_EMBED = 'author:profiles!prompts_author_id_fkey(*)'

const DETAIL_SELECT = `*, ${AUTHOR_EMBED}, images:prompt_images(*), categories:prompt_categories(category:categories(*)), favorites(count)`

type PageParam = string | number | null

function sortImages(prompt: PromptWithRelations): PromptWithRelations {
  return {
    ...prompt,
    images: [...prompt.images].sort((a, b) => a.sort_order - b.sort_order),
  }
}

// Select da listagem: embeds viram !inner quando usados como filtro
// (categoria e favoritos), para que o filtro exclua o prompt em vez de
// só esvaziar o embed.
function buildListSelect(filters: PromptFilters): string {
  const categoryEmbed = filters.categoryId
    ? 'categories:prompt_categories!inner(category:categories(*))'
    : 'categories:prompt_categories(category:categories(*))'
  let select = `*, ${AUTHOR_EMBED}, images:prompt_images(*), ${categoryEmbed}`
  if (filters.favoritesOnly) select += ', my_favorite:favorites!inner(user_id)'
  if (filters.sort === 'favorited') select += ', favorites_count'
  return select
}

async function fetchPage(
  filters: PromptFilters,
  userId: string,
  pageParam: PageParam,
): Promise<PromptWithRelations[]> {
  const searching = filters.search.trim().length > 0

  // Busca usa a RPC search_prompts (FTS + trigram, já ordenada por relevância);
  // sem busca, consulta a tabela direto. Filtros valem para os dois caminhos.
  let query = searching
    ? supabase.rpc('search_prompts', { q: filters.search.trim() }).select(buildListSelect(filters))
    : supabase.from('prompts').select(buildListSelect(filters))

  if (filters.model) query = query.eq('model', filters.model)
  if (filters.authorId) query = query.eq('author_id', filters.authorId)
  if (filters.categoryId) query = query.eq('categories.category_id', filters.categoryId)
  if (filters.favoritesOnly) query = query.eq('my_favorite.user_id', userId)

  if (searching) {
    // Mantém a ordenação por relevância da RPC; paginação por offset.
    const offset = typeof pageParam === 'number' ? pageParam : 0
    query = query.range(offset, offset + PAGE_SIZE - 1)
  } else if (filters.sort === 'recent') {
    // Keyset por created_at (seção 6.2).
    query = query.order('created_at', { ascending: false }).limit(PAGE_SIZE)
    if (typeof pageParam === 'string') query = query.lt('created_at', pageParam)
  } else {
    // Ordenações por contagem não têm cursor natural → offset.
    const offset = typeof pageParam === 'number' ? pageParam : 0
    const column = filters.sort === 'copied' ? 'copy_count' : 'favorites_count'
    query = query
      .order(column, { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as unknown as PromptWithRelations[]).map(sortImages)
}

export function usePromptsInfinite(filters: PromptFilters) {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  return useInfiniteQuery({
    queryKey: ['prompts', 'list', filters, userId],
    initialPageParam: null as PageParam,
    queryFn: ({ pageParam }) => fetchPage(filters, userId, pageParam),
    getNextPageParam: (lastPage, allPages): PageParam | undefined => {
      if (lastPage.length < PAGE_SIZE) return undefined
      const searching = filters.search.trim().length > 0
      if (!searching && filters.sort === 'recent') {
        return lastPage[lastPage.length - 1]?.created_at
      }
      return allPages.length * PAGE_SIZE
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

// Valores distintos de modelo existentes no banco (dropdown "Modelo").
export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.from('prompts').select('model')
      if (error) throw new Error(error.message)
      const models = (data as { model: string }[]).map((row) => row.model)
      return [...new Set(models)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
    },
  })
}

// Lista de profiles (dropdown "Autor").
export function useAuthors() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw new Error(error.message)
      return data as Profile[]
    },
  })
}
