import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useAuthors, useModels } from '../../hooks/usePrompts'
import { useFilters, type SortOption } from '../../hooks/useFilters'
import { Select } from '../ui/Select'
import { CategoryPills } from './CategoryPills'

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Recentes',
  copied: 'Mais copiados',
  favorited: 'Mais favoritados',
}

interface FilterBarProps {
  hideFavoritesPill?: boolean
}

// Barra de filtros abaixo do header (seção 6.2): tabs de categoria
// centralizadas e um botão "Filtros" à direita que expande um painel
// centralizado com ordenação, Modelo e Autor (padrão Dribbble).
export function FilterBar({ hideFavoritesPill = false }: FilterBarProps) {
  const { filters, patchFilters } = useFilters()
  const { data: models } = useModels()
  const { data: authors } = useAuthors()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeFilterCount =
    [filters.model, filters.authorId].filter(Boolean).length + (filters.sort !== 'recent' ? 1 : 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 overflow-hidden">
          <CategoryPills hideFavoritesPill={hideFavoritesPill} />
        </div>

        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-label="Mais filtros"
          onClick={() => setFiltersOpen((open) => !open)}
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-border transition duration-150 ${
            filtersOpen ? 'bg-surface-2 text-text' : 'bg-surface text-text-2 hover:text-text'
          }`}
        >
          <SlidersHorizontal size={16} aria-hidden />
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="flex justify-center">
          <div className="flex animate-fade-in flex-wrap items-center justify-center gap-3 rounded-input bg-surface-2/60 p-3">
            <Select
              aria-label="Ordenação"
              value={filters.sort}
              onChange={(e) => patchFilters({ sort: e.target.value as SortOption })}
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                <option key={option} value={option}>
                  {SORT_LABELS[option]}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Filtrar por modelo"
              value={filters.model ?? ''}
              onChange={(e) => patchFilters({ model: e.target.value || null })}
            >
              <option value="">Modelo: todos</option>
              {(models ?? []).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Filtrar por autor"
              value={filters.authorId ?? ''}
              onChange={(e) => patchFilters({ authorId: e.target.value || null })}
            >
              <option value="">Autor: todos</option>
              {(authors ?? []).map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
