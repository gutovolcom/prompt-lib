import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Heart, ImageOff } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import type { PromptWithRelations } from '../../lib/types'
import { publicImageUrl, thumbPath } from '../../lib/storage'
import { useFavoriteIds, useToggleFavorite } from '../../hooks/useFavorites'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { CardHoverOverlay } from './CardHoverOverlay'

interface PromptCardProps {
  prompt: PromptWithRelations
}

// Card (estilo Dribbble): imagem pura no topo (radius 16px, sem borda/sombra
// em repouso) e metadados (autor, modelo, coração, cópias) abaixo dela.
export function PromptCard({ prompt }: PromptCardProps) {
  const navigate = useNavigate()
  const cover = prompt.images.find((image) => image.is_cover) ?? prompt.images[0]
  const { data: favoriteIds } = useFavoriteIds()
  const toggleFavorite = useToggleFavorite()
  const isFavorite = favoriteIds?.includes(prompt.id) ?? false
  const articleRef = useRef<HTMLElement>(null)

  // Reveal suave ao entrar no viewport — funciona tanto no carregamento
  // inicial quanto para os cards que chegam via infinite scroll.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from(articleRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.35,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: articleRef.current,
          start: 'top 92%',
          toggleActions: 'play none none reverse',
        },
      })
    },
    { scope: articleRef },
  )

  return (
    <article ref={articleRef} className="group mb-8 break-inside-avoid">
      <div
        className="relative cursor-pointer overflow-hidden rounded-card bg-surface-2"
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
            className="w-full transition duration-200 group-hover:scale-[1.01]"
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
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={prompt.author.name} avatarUrl={prompt.author.avatar_url} size={24} />
          <span className="truncate text-[13px] font-semibold text-text">
            {prompt.author.name}
          </span>
          <Badge variant="dark">{prompt.model}</Badge>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            title={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite.mutate({ promptId: prompt.id, next: !isFavorite })
            }}
            className={`transition duration-150 ${
              isFavorite ? 'text-accent' : 'text-text-muted hover:text-text'
            }`}
          >
            <Heart size={14} aria-hidden fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <span
            className="flex items-center gap-1 text-xs font-medium text-text-muted"
            title="Vezes copiado"
          >
            <Copy size={14} aria-hidden />
            {prompt.copy_count}
          </span>
        </div>
      </div>
    </article>
  )
}
