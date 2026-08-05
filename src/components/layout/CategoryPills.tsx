import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useCategories } from '../../hooks/usePrompts'
import { useFilters } from '../../hooks/useFilters'

/** Quantas categorias ficam visíveis na barra; o resto vive em /categorias. */
const VISIBLE_CATEGORIES = 4

// Classes compartilhadas com a aba "Favoritos" (renderizada em FilterBar.tsx,
// fora da região com scroll — ver comentário lá sobre por que ela não pode
// morar dentro deste componente).
export const TAB_BASE =
  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-tab border border-b-0 border-text/35 px-4 py-2 font-mono text-[12.5px] font-bold uppercase tracking-[0.08em] transition-all duration-150'
// A aba ativa é 4px mais alta (pt 11 + pb 9 vs py-2 = 16); o mt-1 nas
// inativas iguala a ALTURA EXTERNA de todas as abas — sem isso a linha
// inteira muda de altura ao trocar a aba ativa e a barra "pula".
export const TAB_ACTIVE = 'border-text bg-surface pb-[9px] pt-[11px] text-text'
export const TAB_INACTIVE =
  'mt-1 bg-surface-2/60 text-text-2 hover:-translate-y-0.5 hover:text-text'

// Seções do arquivo: abas de fichário (Todos + as primeiras categorias na
// ordem sort_order). A aba ativa "sobe" e ganha o fundo de papel, como se
// estivesse à frente das outras no fichário. Só as VISIBLE_CATEGORIES
// primeiras aparecem (mais a ativa, se estiver fora delas) — o índice
// completo vive em /categorias, acessível pela aba "Ver mais". A aba
// Favoritos é renderizada fora deste componente (em FilterBar.tsx) para
// nunca ser cortada pela região com scroll.
export function CategoryPills() {
  const { data: categories } = useCategories()
  const { filters, patchFilters } = useFilters()
  const navigate = useNavigate()

  const visible = (categories ?? []).slice(0, VISIBLE_CATEGORIES)
  const activeOutside = (categories ?? []).find(
    (category) =>
      category.id === filters.categoryId && !visible.some((v) => v.id === category.id),
  )
  const shown = activeOutside ? [...visible, activeOutside] : visible
  const hasMore = (categories ?? []).length > VISIBLE_CATEGORIES

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
      {shown.map((category) => {
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
      {hasMore && (
        <button
          type="button"
          onClick={() => navigate('/categorias')}
          className={`${TAB_BASE} ${TAB_INACTIVE}`}
          title="Ver todas as seções do arquivo"
        >
          Ver mais
          <ArrowRight size={12} aria-hidden />
        </button>
      )}
    </div>
  )
}
