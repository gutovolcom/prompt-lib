import { Heart } from 'lucide-react'
import type { PromptWithRelations } from '../../lib/types'
import { useFavoriteIds, useToggleFavorite } from '../../hooks/useFavorites'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { CopyButton } from '../prompt/CopyButton'

interface CardHoverOverlayProps {
  prompt: PromptWithRelations
}

// Overlay do card no hover (seção 6.2): gradiente escuro de baixo pra cima
// com título, modelo, autor, coração e "Copiar prompt".
export function CardHoverOverlay({ prompt }: CardHoverOverlayProps) {
  const { data: favoriteIds } = useFavoriteIds()
  const toggleFavorite = useToggleFavorite()
  const isFavorite = favoriteIds?.includes(prompt.id) ?? false

  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-white">{prompt.title}</h3>
      <div className="mb-2 flex items-center gap-2">
        <Badge>{prompt.model}</Badge>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={prompt.author.name} avatarUrl={prompt.author.avatar_url} size={24} />
          <span className="truncate text-xs text-white/80">{prompt.author.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Favoritar: otimista, idempotente, rollback em erro (regra 5, seção 8) */}
          <button
            type="button"
            title={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite.mutate({ promptId: prompt.id, next: !isFavorite })
            }}
            className={`rounded-pill p-1.5 transition duration-150 hover:bg-white/10 ${
              isFavorite ? 'text-accent' : 'text-white/70 hover:text-white'
            }`}
          >
            <Heart size={16} aria-hidden fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <CopyButton promptId={prompt.id} promptText={prompt.prompt_text} />
        </div>
      </div>
    </div>
  )
}
