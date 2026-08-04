import type { PromptWithRelations } from '../../lib/types'
import { CopyButton } from '../prompt/CopyButton'

interface CardHoverOverlayProps {
  prompt: PromptWithRelations
}

// Overlay do card: o ícone de copiar fica sempre visível no canto superior
// direito (uma ação só disponível no hover não funciona em telas de toque).
// O título some/aparece com um gradiente sutil, só como reforço no hover.
export function CardHoverOverlay({ prompt }: CardHoverOverlayProps) {
  return (
    <div className="absolute inset-0 rounded-card">
      <div className="pointer-events-none absolute inset-0 rounded-card bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
      <h3 className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 p-4 text-sm font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        {prompt.title}
      </h3>
      <div className="absolute right-3 top-3">
        <CopyButton promptId={prompt.id} promptText={prompt.prompt_text} size="icon" />
      </div>
    </div>
  )
}
