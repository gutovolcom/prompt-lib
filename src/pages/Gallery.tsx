import { useEffect, useMemo, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { HeartOff, ImagePlus, SearchX } from 'lucide-react'
import type { AppOutletContext } from '../App'
import { usePromptsInfinite } from '../hooks/usePrompts'
import { useFilters } from '../hooks/useFilters'
import { FilterBar } from '../components/layout/FilterBar'
import { PromptGrid } from '../components/gallery/PromptGrid'
import { Button } from '../components/ui/Button'

interface GalleryProps {
  /** true na rota /favoritos: força o filtro e oculta a pill Favoritos. */
  favoritesOnly?: boolean
}

export function Gallery({ favoritesOnly = false }: GalleryProps) {
  const { openUpload } = useOutletContext<AppOutletContext>()
  const { filters } = useFilters()

  const effectiveFilters = useMemo(
    () => ({ ...filters, favoritesOnly: filters.favoritesOnly || favoritesOnly }),
    [filters, favoritesOnly],
  )

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePromptsInfinite(effectiveFilters)

  // Infinite scroll: sentinela observada dispara a próxima página.
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '600px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const prompts = useMemo(() => data?.pages.flat() ?? [], [data])

  const searching = effectiveFilters.search.trim().length > 0
  const hasActiveFilters =
    effectiveFilters.categoryId !== null ||
    effectiveFilters.model !== null ||
    effectiveFilters.authorId !== null ||
    filters.favoritesOnly

  function renderEmptyState() {
    if (searching) {
      return (
        <EmptyState icon={<SearchX size={40} aria-hidden className="text-text-muted" />}>
          <h2 className="text-lg font-semibold">Nenhum prompt encontrado</h2>
          <p className="text-sm text-text-muted">Tente outros termos.</p>
        </EmptyState>
      )
    }
    if (favoritesOnly || filters.favoritesOnly) {
      return (
        <EmptyState icon={<HeartOff size={40} aria-hidden className="text-text-muted" />}>
          <h2 className="text-lg font-semibold">Nenhum favorito ainda</h2>
          <p className="text-sm text-text-muted">
            Passe o mouse sobre um card e clique no coração para salvar aqui.
          </p>
        </EmptyState>
      )
    }
    if (hasActiveFilters) {
      return (
        <EmptyState icon={<SearchX size={40} aria-hidden className="text-text-muted" />}>
          <h2 className="text-lg font-semibold">Nenhum prompt com esses filtros</h2>
          <p className="text-sm text-text-muted">Ajuste ou limpe os filtros para ver mais.</p>
        </EmptyState>
      )
    }
    return (
      <EmptyState icon={<ImagePlus size={40} aria-hidden className="text-text-muted" />}>
        <h2 className="text-lg font-semibold">Nenhum prompt por aqui ainda</h2>
        <p className="max-w-sm text-sm text-text-muted">
          A biblioteca está vazia. Compartilhe o primeiro prompt de imagem que deu certo para o
          time reutilizar.
        </p>
        <Button type="button" onClick={openUpload}>
          Suba o primeiro prompt
        </Button>
      </EmptyState>
    )
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4">
      <FilterBar hideFavoritesPill={favoritesOnly} />

      {isLoading && (
        <p className="py-12 text-center text-sm text-text-muted">Carregando prompts...</p>
      )}

      {isError && (
        <p className="py-12 text-center text-sm text-text-muted">
          Erro ao carregar os prompts. Recarregue a página.
        </p>
      )}

      {!isLoading && !isError && prompts.length === 0 && renderEmptyState()}

      {prompts.length > 0 && (
        <>
          <PromptGrid prompts={prompts} />
          <div ref={sentinelRef} aria-hidden />
          {isFetchingNextPage && (
            <p className="py-4 text-center text-sm text-text-muted">Carregando mais...</p>
          )}
        </>
      )}
    </main>
  )
}

function EmptyState({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border bg-surface px-8 py-20 text-center">
      {icon}
      {children}
    </div>
  )
}
