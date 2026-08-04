import { useEffect, useMemo, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { HeartOff, ImagePlus, SearchX } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import type { AppOutletContext } from '../App'
import { usePromptsInfinite } from '../hooks/usePrompts'
import { useFilters } from '../hooks/useFilters'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { FilterBar } from '../components/layout/FilterBar'
import { PromptGrid } from '../components/gallery/PromptGrid'
import { PromptGridSkeleton } from '../components/gallery/PromptGridSkeleton'
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

  const heroRef = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.from(heroRef.current, { opacity: 0, y: 16, duration: 0.4, ease: 'power1.out' })
  }, [])

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
          <h2 className="text-xl font-bold">Nenhum prompt encontrado</h2>
          <p className="text-sm text-text-2">Tente outros termos.</p>
        </EmptyState>
      )
    }
    if (favoritesOnly || filters.favoritesOnly) {
      return (
        <EmptyState icon={<HeartOff size={40} aria-hidden className="text-text-muted" />}>
          <h2 className="text-xl font-bold">Nenhum favorito ainda</h2>
          <p className="text-sm text-text-2">
            Passe o mouse sobre um card e clique no coração para salvar aqui.
          </p>
        </EmptyState>
      )
    }
    if (hasActiveFilters) {
      return (
        <EmptyState icon={<SearchX size={40} aria-hidden className="text-text-muted" />}>
          <h2 className="text-xl font-bold">Nenhum prompt com esses filtros</h2>
          <p className="text-sm text-text-2">Ajuste ou limpe os filtros para ver mais.</p>
        </EmptyState>
      )
    }
    return (
      <EmptyState icon={<ImagePlus size={40} aria-hidden className="text-text-muted" />}>
        <h2 className="text-xl font-bold">Nenhum prompt por aqui ainda</h2>
        <p className="max-w-sm text-sm text-text-2">
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
    <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 pb-16 pt-10">
      <div ref={heroRef}>
        {!favoritesOnly && (
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              Biblioteca de prompts GCO
            </h1>
            <p className="mt-4 text-base text-text-2 sm:text-lg">
              Prompts de imagem testados pelo time de marketing. Copie, adapte e crie.
            </p>
          </div>
        )}
        {favoritesOnly && (
          <h1 className="text-center text-4xl font-extrabold tracking-tight">Favoritos</h1>
        )}
      </div>

      <FilterBar hideFavoritesPill={favoritesOnly} />

      {isLoading && <PromptGridSkeleton />}

      {isError && (
        <p className="py-12 text-center text-sm text-text-2">
          Erro ao carregar os prompts. Recarregue a página.
        </p>
      )}

      {!isLoading && !isError && prompts.length === 0 && renderEmptyState()}

      {prompts.length > 0 && (
        <>
          <PromptGrid prompts={prompts} />
          <div ref={sentinelRef} aria-hidden />
          {isFetchingNextPage && (
            <p className="py-4 text-center text-sm text-text-2">Carregando mais...</p>
          )}
        </>
      )}
    </main>
  )
}

function EmptyState({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border bg-surface-2/50 px-8 py-24 text-center">
      {icon}
      {children}
    </div>
  )
}
