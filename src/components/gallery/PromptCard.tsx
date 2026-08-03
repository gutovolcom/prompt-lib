import { useNavigate } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import type { PromptWithRelations } from '../../lib/types'
import { publicImageUrl, thumbPath } from '../../lib/storage'
import { CardHoverOverlay } from './CardHoverOverlay'

interface PromptCardProps {
  prompt: PromptWithRelations
}

// Card (seção 6.2): estado normal só a imagem (cantos 12px, aspect ratio da
// capa preservado); grid usa a thumb, detalhe usa a original.
export function PromptCard({ prompt }: PromptCardProps) {
  const navigate = useNavigate()
  const cover = prompt.images.find((image) => image.is_cover) ?? prompt.images[0]

  return (
    <article
      className="group relative mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-card bg-surface"
      onClick={() => navigate(`/p/${prompt.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') navigate(`/p/${prompt.id}`)
      }}
      tabIndex={0}
      role="link"
      aria-label={`Abrir detalhes de ${prompt.title}`}
    >
      {cover ? (
        <img
          src={publicImageUrl(thumbPath(cover.storage_path))}
          alt={prompt.title}
          loading="lazy"
          className="w-full"
          style={
            cover.width && cover.height
              ? { aspectRatio: `${cover.width} / ${cover.height}` }
              : undefined
          }
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center text-text-muted">
          <ImageOff size={28} aria-hidden />
          <span className="sr-only">Sem imagem</span>
        </div>
      )}
      <CardHoverOverlay prompt={prompt} />
    </article>
  )
}
