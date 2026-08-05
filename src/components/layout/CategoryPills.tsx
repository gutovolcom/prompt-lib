import { Heart } from 'lucide-react'
import { useCategories } from '../../hooks/usePrompts'
import { useFilters } from '../../hooks/useFilters'

interface CategoryPillsProps {
  /** Na página /favoritos o filtro já é forçado; a pill fica oculta. */
  hideFavoritesPill?: boolean
}

// Seções do arquivo: abas de fichário (Todos + categorias na ordem
// sort_order) + aba Favoritos. A aba ativa "sobe" e ganha o fundo de papel,
// como se estivesse à frente das outras no fichário.
export function CategoryPills({ hideFavoritesPill = false }: CategoryPillsProps) {
  const { data: categories } = useCategories()
  const { filters, patchFilters } = useFilters()

  const tabBase =
    'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-tab border border-b-0 border-text/35 px-4 py-2 font-mono text-[12.5px] font-bold uppercase tracking-[0.08em] transition-all duration-150'
  const active = 'border-text bg-surface pb-[9px] pt-[11px] text-text'
  const inactive = 'bg-surface-2/60 text-text-2 hover:-translate-y-0.5 hover:text-text'

  return (
    <div className="no-scrollbar flex items-end gap-1.5 overflow-x-auto">
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
            className={`${tabBase} ${isActive ? active : inactive}`}
          >
            <span
              className="h-2 w-2 rounded-full border border-text/30"
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
          className={`${tabBase} ${filters.favoritesOnly ? active : inactive}`}
        >
          <Heart
            size={13}
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
