import type { PromptWithRelations } from '../../lib/types'
import { CopyButton } from '../prompt/CopyButton'

interface CardHoverOverlayProps {
  prompt: PromptWithRelations
}

// Overlay do card no hover: gradiente sutil de baixo pra cima com o título
// e a ação de copiar (metadados de autor/favorito ficam abaixo do card).
export function CardHoverOverlay({ prompt }: CardHoverOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end rounded-card bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white">{prompt.title}</h3>
      <CopyButton promptId={prompt.id} promptText={prompt.prompt_text} />
    </div>
  )
}
