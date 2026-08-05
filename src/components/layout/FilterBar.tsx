import { useRef, useState } from 'react'
import { Heart, SlidersHorizontal } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { useAuthors, useModels } from '../../hooks/usePrompts'
import { useFilters, type SortOption } from '../../hooks/useFilters'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { Dropdown } from '../ui/Dropdown'
import { CategoryPills, TAB_ACTIVE, TAB_BASE, TAB_INACTIVE } from './CategoryPills'

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
        gsap.set(el, {
          height: filtersOpen ? 'auto' : 0,
          opacity: filtersOpen ? 1 : 0,
          overflow: filtersOpen ? 'visible' : 'hidden',
        })
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
            // overflow visível para os menus dos dropdowns não serem cortados
            onComplete: () => gsap.set(el, { height: 'auto', overflow: 'visible' }),
          },
        )
      } else {
        gsap.set(el, { overflow: 'hidden', height: el.offsetHeight })
        gsap.to(el, { height: 0, opacity: 0, duration: 0.2, ease: 'power2.in' })
      }
    },
    { dependencies: [filtersOpen] },
  )

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-end gap-1.5 border-b-2 border-text pb-0">
        <div className="min-w-0 flex-1 overflow-hidden">
          <CategoryPills />
        </div>

        {!hideFavoritesPill && (
          <button
            type="button"
            aria-pressed={filters.favoritesOnly}
            onClick={() => patchFilters({ favoritesOnly: !filters.favoritesOnly })}
            className={`${TAB_BASE} ${filters.favoritesOnly ? TAB_ACTIVE : TAB_INACTIVE}`}
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
            <Dropdown
              aria-label="Ordenação"
              value={filters.sort}
              options={(Object.keys(SORT_LABELS) as SortOption[]).map((option) => ({
                value: option,
                label: SORT_LABELS[option],
              }))}
              onChange={(value) => patchFilters({ sort: value as SortOption })}
            />

            <Dropdown
              aria-label="Filtrar por modelo"
              value={filters.model ?? ''}
              options={[
                { value: '', label: 'Modelo: todos' },
                ...(models ?? []).map((model) => ({ value: model, label: model })),
              ]}
              onChange={(value) => patchFilters({ model: value || null })}
            />

            <Dropdown
              aria-label="Filtrar por autor"
              value={filters.authorId ?? ''}
              options={[
                { value: '', label: 'Autor: todos' },
                ...(authors ?? []).map((author) => ({ value: author.id, label: author.name })),
              ]}
              onChange={(value) => patchFilters({ authorId: value || null })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
