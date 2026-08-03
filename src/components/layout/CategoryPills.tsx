import { Heart } from 'lucide-react'
import { useCategories } from '../../hooks/usePrompts'
import { useFilters } from '../../hooks/useFilters'

interface CategoryPillsProps {
  /** Na página /favoritos o filtro já é forçado; a pill fica oculta. */
  hideFavoritesPill?: boolean
}

// Pills de categoria (Todos + categorias na ordem sort_order) + pill Favoritos.
export function CategoryPills({ hideFavoritesPill = false }: CategoryPillsProps) {
  const { data: categories } = useCategories()
  const { filters, patchFilters } = useFilters()

  const pillBase =
    'shrink-0 rounded-pill border px-3 py-1 text-xs font-medium transition duration-150'
  const inactive = 'border-border bg-surface-2 text-text-muted hover:text-text'

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      <button
        type="button"
        aria-pressed={filters.categoryId === null}
        onClick={() => patchFilters({ categoryId: null })}
        className={`${pillBase} ${
          filters.categoryId === null ? 'border-transparent bg-accent text-white' : inactive
        }`}
      >
        Todos
      </button>
      {(categories ?? []).map((category) => {
        const active = filters.categoryId === category.id
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={active}
            onClick={() => patchFilters({ categoryId: active ? null : category.id })}
            className={`${pillBase} ${active ? 'border-transparent text-white' : inactive}`}
            style={active ? { backgroundColor: category.color } : undefined}
          >
            {category.name}
          </button>
        )
      })}
      {!hideFavoritesPill && (
        <button
          type="button"
          aria-pressed={filters.favoritesOnly}
          onClick={() => patchFilters({ favoritesOnly: !filters.favoritesOnly })}
          className={`${pillBase} inline-flex items-center gap-1 ${
            filters.favoritesOnly ? 'border-transparent bg-accent text-white' : inactive
          }`}
        >
          <Heart size={12} aria-hidden />
          Favoritos
        </button>
      )}
    </div>
  )
}
