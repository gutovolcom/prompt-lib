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

// Barra de filtros abaixo do header (seção 6.2): ordenação à esquerda,
// tabs de categoria centralizadas, dropdowns Modelo/Autor à direita.
export function FilterBar({ hideFavoritesPill = false }: FilterBarProps) {
  const { filters, patchFilters } = useFilters()
  const { data: models } = useModels()
  const { data: authors } = useAuthors()

  return (
    <div className="flex flex-wrap items-center gap-3">
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

      <div className="flex flex-1 justify-center overflow-x-auto">
        <CategoryPills hideFavoritesPill={hideFavoritesPill} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
  )
}
