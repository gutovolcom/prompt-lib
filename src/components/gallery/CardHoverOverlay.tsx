import type { PromptWithRelations } from '../../lib/types'
import { CopyButton } from '../prompt/CopyButton'

interface CardHoverOverlayProps {
  prompt: PromptWithRelations
}

// Overlay do card no hover: título sobre gradiente sutil na base da imagem;
// o ícone de copiar fica discreto no canto superior direito (evita um botão
// grande e chamativo sobre a imagem).
export function CardHoverOverlay({ prompt }: CardHoverOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <div className="absolute inset-0 rounded-card bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <h3 className="absolute inset-x-0 bottom-0 line-clamp-2 p-4 text-sm font-semibold text-white">
        {prompt.title}
      </h3>
      <div className="pointer-events-auto absolute right-3 top-3">
        <CopyButton promptId={prompt.id} promptText={prompt.prompt_text} size="icon" />
      </div>
    </div>
  )
}
