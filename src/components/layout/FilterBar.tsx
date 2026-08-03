import { useAuthors, useModels } from '../../hooks/usePrompts'
import { useFilters, type SortOption } from '../../hooks/useFilters'
import { CategoryPills } from './CategoryPills'

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Recentes',
  copied: 'Mais copiados',
  favorited: 'Mais favoritados',
}

interface FilterBarProps {
  hideFavoritesPill?: boolean
}

// Barra de filtros abaixo do header (seção 6.2): pills de categoria,
// pill Favoritos, dropdowns Modelo/Autor e toggle de ordenação.
export function FilterBar({ hideFavoritesPill = false }: FilterBarProps) {
  const { filters, patchFilters } = useFilters()
  const { data: models } = useModels()
  const { data: authors } = useAuthors()

  const selectClasses =
    'rounded-input border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-text focus:border-accent focus:outline-none'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CategoryPills hideFavoritesPill={hideFavoritesPill} />

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <select
          aria-label="Filtrar por modelo"
          value={filters.model ?? ''}
          onChange={(e) => patchFilters({ model: e.target.value || null })}
          className={selectClasses}
        >
          <option value="">Modelo: todos</option>
          {(models ?? []).map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por autor"
          value={filters.authorId ?? ''}
          onChange={(e) => patchFilters({ authorId: e.target.value || null })}
          className={selectClasses}
        >
          <option value="">Autor: todos</option>
          {(authors ?? []).map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>

        <div
          role="group"
          aria-label="Ordenação"
          className="flex overflow-hidden rounded-input border border-border"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filters.sort === option}
              onClick={() => patchFilters({ sort: option })}
              className={`px-2.5 py-1.5 text-xs font-medium transition duration-150 ${
                filters.sort === option
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-text-muted hover:text-text'
              }`}
            >
              {SORT_LABELS[option]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
