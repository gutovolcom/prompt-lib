import { useNavigate } from 'react-router-dom'
import { Heart, Layers } from 'lucide-react'
import { useCategoriesWithCount, usePromptCount } from '../hooks/usePrompts'
import { useFavoriteIds } from '../hooks/useFavorites'
import { useFilters } from '../hooks/useFilters'

interface DrawerProps {
  label: string
  count: number | undefined
  dotColor?: string
  icon?: React.ReactNode
  onOpen: () => void
}

// Frente de gaveta do gaveteiro: corpo grafite com porta-etiqueta de papel
// (mesma linguagem do logo no header) e puxador desenhado em CSS. Abrir a
// gaveta = aplicar o filtro da seção e voltar para a galeria.
function Drawer({ label, count, dotColor, icon, onOpen }: DrawerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Abrir seção ${label}`}
      className="group flex flex-col items-center gap-3 rounded-card border border-cabinet-dark bg-gradient-to-b from-cabinet to-cabinet-dark px-5 pb-5 pt-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:-translate-y-1"
    >
      {/* Puxador */}
      <span
        aria-hidden
        className="h-2 w-14 rounded-full border border-black/40 bg-surface/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-200 group-hover:translate-y-0.5"
      />
      {/* Porta-etiqueta */}
      <span className="flex w-full flex-col items-center gap-1 rounded-input border-2 border-cabinet-dark bg-surface px-3 py-2.5 shadow-[inset_0_0_0_2px_rgba(198,162,84,0.5)]">
        <span className="flex items-center gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-text">
          {dotColor && (
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full border border-text/30"
              style={{ backgroundColor: dotColor }}
            />
          )}
          {icon}
          <span className="truncate">{label}</span>
        </span>
        <span className="font-mono text-[10.5px] tracking-[0.08em] text-text-2">
          {count === undefined ? '…' : `${count} ficha${count === 1 ? '' : 's'}`}
        </span>
      </span>
    </button>
  )
}

// Índice do arquivo (/categorias): todas as seções como gavetas do
// gaveteiro. A barra da galeria mostra só as primeiras; aqui mora o
// catálogo completo. Abrir uma gaveta aplica o filtro (o FiltersProvider
// vive no layout, então persiste na navegação) e volta para a galeria.
export function Categories() {
  const navigate = useNavigate()
  const { filters, patchFilters } = useFilters()
  const { data: categories, isLoading, isError } = useCategoriesWithCount()
  const { data: totalCount } = usePromptCount()
  const { data: favoriteIds } = useFavoriteIds()

  function openSection(patch: Parameters<typeof patchFilters>[0]) {
    patchFilters({ categoryId: null, favoritesOnly: false, ...patch })
    navigate('/')
  }

  return (
    <main className="mx-auto flex max-w-[1360px] flex-col gap-10 px-6 pb-16 pt-12">
      <div className="text-center">
        <span className="mb-5 inline-block border-y border-text-muted px-1 font-mono text-xs uppercase tracking-[0.32em] text-text-2">
          índice do arquivo
        </span>
        <h1 className="font-display text-[clamp(2.2rem,4.5vw,3.25rem)] font-bold leading-tight tracking-tight">
          Seções
        </h1>
        <p className="mt-3 text-base text-text-2">
          Cada gaveta guarda as fichas de uma seção. Abra uma para consultar.
        </p>
      </div>

      {isLoading && (
        <p className="py-12 text-center font-mono text-sm text-text-2">Abrindo o gaveteiro…</p>
      )}

      {isError && (
        <p className="py-12 text-center text-sm text-text-2">
          Erro ao carregar as seções. Recarregue a página.
        </p>
      )}

      {categories && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          <Drawer
            label="Todos"
            count={totalCount}
            icon={<Layers size={13} aria-hidden className="shrink-0 text-text-2" />}
            onOpen={() => openSection({})}
          />
          {categories.map((category) => (
            <Drawer
              key={category.id}
              label={category.name}
              count={category.prompt_categories[0]?.count ?? 0}
              dotColor={category.color}
              onOpen={() =>
                openSection({
                  categoryId: filters.categoryId === category.id ? null : category.id,
                })
              }
            />
          ))}
          <Drawer
            label="Favoritos"
            count={favoriteIds?.length}
            icon={<Heart size={13} aria-hidden className="shrink-0 text-accent" />}
            onOpen={() => openSection({ favoritesOnly: true })}
          />
        </div>
      )}
    </main>
  )
}
