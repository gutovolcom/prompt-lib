import { Heart } from 'lucide-react'
import type { PromptWithRelations } from '../../lib/types'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { CopyButton } from '../prompt/CopyButton'

interface CardHoverOverlayProps {
  prompt: PromptWithRelations
}

// Overlay do card no hover (seção 6.2): gradiente escuro de baixo pra cima
// com título, modelo, autor, coração e "Copiar prompt".
export function CardHoverOverlay({ prompt }: CardHoverOverlayProps) {
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
          {/* Favoritar chega na Fase 3 */}
          <button
            type="button"
            disabled
            title="Favoritos em breve"
            aria-label="Favoritar (em breve)"
            onClick={(e) => e.stopPropagation()}
            className="rounded-pill p-1.5 text-white/60 disabled:cursor-not-allowed"
          >
            <Heart size={16} aria-hidden />
          </button>
          <CopyButton promptId={prompt.id} promptText={prompt.prompt_text} />
        </div>
      </div>
    </div>
  )
}
