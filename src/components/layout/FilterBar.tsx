import { useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { useAuthors, useModels } from '../../hooks/usePrompts'
import { useFilters, type SortOption } from '../../hooks/useFilters'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
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
// centralizado com ordenação, Modelo e Autor (padrão Dribbble). O painel
// fica sempre montado; só a altura anima entre 0 e o tamanho natural.
export function FilterBar({ hideFavoritesPill = false }: FilterBarProps) {
  const { filters, patchFilters } = useFilters()
  const { data: models } = useModels()
  const { data: authors } = useAuthors()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelContentRef = useRef<HTMLDivElement>(null)

  const activeFilterCount =
    [filters.model, filters.authorId].filter(Boolean).length + (filters.sort !== 'recent' ? 1 : 0)

  useGSAP(
    () => {
      const el = panelRef.current
      const content = panelContentRef.current
      if (!el || !content) return

      if (prefersReducedMotion()) {
        gsap.set(el, { height: filtersOpen ? 'auto' : 0, opacity: filtersOpen ? 1 : 0 })
        return
      }

      if (filtersOpen) {
        gsap.fromTo(
          el,
          { height: 0, opacity: 0 },
          {
            height: content.scrollHeight,
            opacity: 1,
            duration: 0.25,
            ease: 'power2.out',
            onComplete: () => gsap.set(el, { height: 'auto' }),
          },
        )
      } else {
        gsap.set(el, { height: el.offsetHeight })
        gsap.to(el, { height: 0, opacity: 0, duration: 0.2, ease: 'power2.in' })
      }
    },
    { dependencies: [filtersOpen] },
  )

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-end gap-1.5 border-b-2 border-text pb-0">
        <div className="min-w-0 flex-1 overflow-hidden">
          <CategoryPills hideFavoritesPill={hideFavoritesPill} />
        </div>

        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-label="Mais filtros"
          onClick={() => setFiltersOpen((open) => !open)}
          className={`relative mb-1.5 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-input border-[1.5px] border-dashed px-3.5 py-[7px] font-mono text-xs uppercase tracking-[0.06em] transition duration-150 ${
            filtersOpen ? 'border-text text-text' : 'border-text-muted text-text-2 hover:border-text hover:text-text'
          }`}
        >
          <SlidersHorizontal size={14} aria-hidden />
          Filtros
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div ref={panelRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
        <div ref={panelContentRef} className="flex justify-center pt-4">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-input border border-border bg-surface-2/60 p-3">
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
      </div>
    </div>
  )
}
