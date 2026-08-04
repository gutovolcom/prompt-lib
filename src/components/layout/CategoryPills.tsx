import { Heart } from 'lucide-react'
import { useCategories } from '../../hooks/usePrompts'
import { useFilters } from '../../hooks/useFilters'

interface CategoryPillsProps {
  /** Na página /favoritos o filtro já é forçado; a pill fica oculta. */
  hideFavoritesPill?: boolean
}

// Tabs de categoria (Todos + categorias na ordem sort_order) + pill Favoritos.
export function CategoryPills({ hideFavoritesPill = false }: CategoryPillsProps) {
  const { data: categories } = useCategories()
  const { filters, patchFilters } = useFilters()

  const tabBase = 'shrink-0 rounded-pill px-4 py-2 text-sm font-medium transition duration-150'
  const active = 'bg-surface-2 font-semibold text-text'
  const inactive = 'text-text-2 hover:text-text'

  return (
    <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
      <button
        type="button"
        aria-pressed={filters.categoryId === null}
        onClick={() => patchFilters({ categoryId: null })}
        className={`${tabBase} ${filters.categoryId === null ? active : inactive}`}
      >
        Todos
      </button>
      {(categories ?? []).map((category) => {
        const isActive = filters.categoryId === category.id
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => patchFilters({ categoryId: isActive ? null : category.id })}
            className={`${tabBase} inline-flex items-center gap-1.5 ${isActive ? active : inactive}`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
            {category.name}
          </button>
        )
      })}
      {!hideFavoritesPill && (
        <button
          type="button"
          aria-pressed={filters.favoritesOnly}
          onClick={() => patchFilters({ favoritesOnly: !filters.favoritesOnly })}
          className={`${tabBase} inline-flex items-center gap-1.5 ${
            filters.favoritesOnly ? active : inactive
          }`}
        >
          <Heart
            size={14}
            aria-hidden
            fill={filters.favoritesOnly ? 'currentColor' : 'none'}
            className={filters.favoritesOnly ? 'text-accent' : undefined}
          />
          Favoritos
        </button>
      )}
    </div>
  )
}
