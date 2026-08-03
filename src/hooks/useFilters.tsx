import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type SortOption = 'recent' | 'copied' | 'favorited'

export interface PromptFilters {
  search: string
  categoryId: number | null
  favoritesOnly: boolean
  model: string | null
  authorId: string | null
  sort: SortOption
}

export const DEFAULT_FILTERS: PromptFilters = {
  search: '',
  categoryId: null,
  favoritesOnly: false,
  model: null,
  authorId: null,
  sort: 'recent',
}

interface FiltersContextValue {
  filters: PromptFilters
  patchFilters: (patch: Partial<PromptFilters>) => void
}

const FiltersContext = createContext<FiltersContextValue | null>(null)

// Estado compartilhado entre a busca do Header e a barra de filtros da galeria
// (seção 6.2: filtros de categoria/modelo/autor aplicados por cima da busca).
export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<PromptFilters>(DEFAULT_FILTERS)

  const patchFilters = useCallback((patch: Partial<PromptFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
  }, [])

  const value = useMemo(() => ({ filters, patchFilters }), [filters, patchFilters])

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export function useFilters(): FiltersContextValue {
  const ctx = useContext(FiltersContext)
  if (!ctx) throw new Error('useFilters deve ser usado dentro de <FiltersProvider>.')
  return ctx
}
