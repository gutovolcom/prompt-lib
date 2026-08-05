import { useCategories } from '../../hooks/usePrompts'
import { useFilters } from '../../hooks/useFilters'

// Classes compartilhadas com a aba "Favoritos" (renderizada em FilterBar.tsx,
// fora da região com scroll — ver comentário lá sobre por que ela não pode
// morar dentro deste componente).
export const TAB_BASE =
  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-tab border border-b-0 border-text/35 px-4 py-2 font-mono text-[12.5px] font-bold uppercase tracking-[0.08em] transition-all duration-150'
export const TAB_ACTIVE = 'border-text bg-surface pb-[9px] pt-[11px] text-text'
export const TAB_INACTIVE = 'bg-surface-2/60 text-text-2 hover:-translate-y-0.5 hover:text-text'

// Seções do arquivo: abas de fichário (Todos + categorias na ordem
// sort_order). A aba ativa "sobe" e ganha o fundo de papel, como se
// estivesse à frente das outras no fichário. Fica dentro de uma região com
// overflow-x-auto (scroll horizontal) quando há muitas categorias — por
// isso a aba Favoritos, que precisa estar sempre visível junto do botão
// Filtros, é renderizada fora deste componente.
export function CategoryPills() {
  const { data: categories } = useCategories()
  const { filters, patchFilters } = useFilters()

  return (
    <div className="no-scrollbar flex items-end gap-1.5 overflow-x-auto">
      <button
        type="button"
        aria-pressed={filters.categoryId === null}
        onClick={() => patchFilters({ categoryId: null })}
        className={`${TAB_BASE} ${filters.categoryId === null ? TAB_ACTIVE : TAB_INACTIVE}`}
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
            className={`${TAB_BASE} ${isActive ? TAB_ACTIVE : TAB_INACTIVE}`}
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
    </div>
  )
}
