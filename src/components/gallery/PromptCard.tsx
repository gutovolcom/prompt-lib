import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Heart, ImageOff } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import type { PromptWithRelations } from '../../lib/types'
import { publicImageUrl, thumbPath } from '../../lib/storage'
import { catalogCode } from '../../lib/catalog'
import { useFavoriteIds, useToggleFavorite } from '../../hooks/useFavorites'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { Avatar } from '../ui/Avatar'
import { CopyButton } from '../prompt/CopyButton'

interface PromptCardProps {
  prompt: PromptWithRelations
  /** "secret" = pasta confidencial do destaque da semana (carvão + TOP SECRET). */
  variant?: 'default' | 'secret'
}

// Posição da aba alterna por número de catálogo (como num arquivo físico,
// onde as abas se revezam para ficarem visíveis na gaveta).
const TAB_POSITION = ['left-1', 'left-[31%]', 'right-1'] as const

// Card-pasta (identidade "O Arquivo"): aba com o código de catálogo, foto
// "dentro" da pasta que desliza para fora no hover e frente da pasta com
// título em serif, trecho datilografado da fórmula, autor e contadores.
export function PromptCard({ prompt, variant = 'default' }: PromptCardProps) {
  const navigate = useNavigate()
  const cover = prompt.images.find((image) => image.is_cover) ?? prompt.images[0]
  const { data: favoriteIds } = useFavoriteIds()
  const toggleFavorite = useToggleFavorite()
  const isFavorite = favoriteIds?.includes(prompt.id) ?? false
  const articleRef = useRef<HTMLElement>(null)
  const secret = variant === 'secret'
  const code = catalogCode(prompt.catalog_number)
  const tabPosition = TAB_POSITION[(prompt.catalog_number ?? 0) % 3]
  const tilt = (prompt.catalog_number ?? 0) % 2 === 0 ? 'rotate-[-0.8deg]' : 'rotate-[0.9deg]'

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
    <article
      ref={articleRef}
      className={`group relative cursor-pointer [perspective:900px] ${secret ? 'sm:col-span-2' : ''}`}
      onClick={() => navigate(`/p/${prompt.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') navigate(`/p/${prompt.id}`)
      }}
      tabIndex={0}
      role="link"
      aria-label={`Abrir ficha ${code} — ${prompt.title}`}
    >
      {/* Aba da pasta */}
      <span
        className={`absolute -top-4 z-[1] flex h-5 items-center justify-center rounded-tab border border-b-0 px-2 font-mono text-[10px] font-bold tracking-[0.14em] ${tabPosition} ${
          secret
            ? 'w-[30%] border-black/50 bg-secret-dark text-secret-text/90'
            : 'w-[38%] border-manila-deep/60 bg-manila-dark text-text/75'
        }`}
      >
        {secret ? `★ ${code}` : code}
      </span>

      {/* Verso da pasta com a foto dentro */}
      <div
        className={`relative z-[2] rounded-t-[5px] rounded-b-card border px-3 pt-3 shadow-md ${
          secret ? 'border-black/50 bg-secret-dark' : 'border-manila-deep/60 bg-manila-dark'
        }`}
      >
        {/* Transform base em classes (não style inline): estilo inline vence as
            variantes group-hover: e mataria a animação de "foto saindo da pasta". */}
        <div
          className={`relative z-[3] -mt-0.5 translate-y-[14px] bg-white p-[7px] pb-[9px] shadow-sm transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:rotate-0 ${tilt}`}
        >
          {cover ? (
            <img
              src={publicImageUrl(thumbPath(cover.storage_path))}
              alt={prompt.title}
              loading="lazy"
              className={`w-full object-cover ${secret ? 'h-[210px]' : 'h-[168px]'}`}
            />
          ) : (
            <div
              className={`flex w-full items-center justify-center bg-surface-2 text-text-muted ${
                secret ? 'h-[210px]' : 'h-[168px]'
              }`}
            >
              <ImageOff size={28} aria-hidden />
              <span className="sr-only">Sem imagem</span>
            </div>
          )}
        </div>
        <div className="absolute right-2 top-2 z-[5]">
          <CopyButton promptId={prompt.id} promptText={prompt.prompt_text} size="icon" />
        </div>
      </div>

      {/* Frente da pasta */}
      <div
        className={`relative z-[4] -mx-px -mt-[74px] origin-bottom rounded-[4px_14px_7px_7px] border px-4 pb-3 pt-3.5 shadow-[0_-3px_8px_rgba(52,42,21,0.14)] transition-transform duration-300 group-hover:[transform:rotateX(7deg)] ${
          secret
            ? 'border-black/55 bg-gradient-to-b from-secret to-secret-dark text-secret-text'
            : 'border-manila-deep/70 bg-gradient-to-b from-manila to-manila-dark'
        }`}
      >
        <div
          className={`flex items-center justify-between font-mono text-[10.5px] font-bold tracking-[0.1em] ${
            secret ? 'text-secret-text/60' : 'text-text/60'
          }`}
        >
          <span>{code}</span>
          <span
            className={`rounded-[2px] border px-1.5 py-0.5 text-[9px] tracking-[0.12em] ${
              secret
                ? 'border-secret-text/40 text-secret-text/75'
                : 'border-text/30 bg-surface text-text-2'
            }`}
          >
            {prompt.model.toUpperCase()}
          </span>
        </div>

        <h3
          className={`mt-1.5 line-clamp-2 font-display font-bold leading-tight tracking-tight ${
            secret ? 'text-[21px] text-secret-text' : 'text-[17px]'
          }`}
        >
          {prompt.title}
        </h3>

        <p
          className={`mt-1.5 line-clamp-2 font-mono text-[11.5px] leading-normal ${
            secret ? 'text-secret-text/65' : 'text-text/70'
          }`}
        >
          {prompt.prompt_text}
        </p>

        <div
          className={`mt-2.5 flex items-center justify-between border-t border-dashed pt-2 font-mono text-[11px] ${
            secret ? 'border-secret-text/30 text-secret-text/80' : 'border-manila-deep/70 text-text/75'
          }`}
        >
          <span className="flex min-w-0 items-center gap-2 font-bold">
            <Avatar name={prompt.author.name} avatarUrl={prompt.author.avatar_url} size={22} />
            <span className="truncate">{prompt.author.name}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              title={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
              aria-pressed={isFavorite}
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite.mutate({ promptId: prompt.id, next: !isFavorite })
              }}
              className={`flex items-center gap-1 transition duration-150 ${
                isFavorite
                  ? secret
                    ? 'text-[#E86A5A]'
                    : 'text-accent'
                  : secret
                    ? 'text-secret-text/60 hover:text-secret-text'
                    : 'text-text/50 hover:text-text'
              }`}
            >
              <Heart size={13} aria-hidden fill={isFavorite ? 'currentColor' : 'none'} />
              {/* contador de favoritos fica no dossiê; aqui só o coração */}
            </button>
            <span className="flex items-center gap-1" title="Vezes copiado">
              <Copy size={13} aria-hidden />
              {prompt.copy_count}
            </span>
          </span>
        </div>
      </div>

      {/* Adereços da pasta confidencial */}
      {secret && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-card"
          >
            <span className="absolute -right-9 top-6 rotate-[30deg] bg-secret-red px-11 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-md">
              Top&nbsp;Secret
            </span>
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute left-6 top-[84px] z-[6] -rotate-[9deg] rounded-input border-[2.5px] border-secret-red bg-surface/80 px-3.5 py-1.5 text-center font-mono text-[15px] font-bold uppercase tracking-[0.24em] text-secret-red"
          >
            Destaque
            <small className="block text-[8.5px] tracking-[0.34em]">da semana</small>
          </span>
          <svg
            aria-hidden
            className="pointer-events-none absolute bottom-[84px] right-5 z-[6]"
            width="70"
            height="34"
            viewBox="0 0 70 34"
          >
            <circle cx="14" cy="17" r="7" fill="none" stroke="rgba(239,231,210,.75)" strokeWidth="2" />
            <circle cx="56" cy="17" r="7" fill="none" stroke="rgba(239,231,210,.75)" strokeWidth="2" />
            <path d="M20 15 C 32 8, 40 26, 50 19" fill="none" stroke="rgba(239,231,210,.55)" strokeWidth="1.6" />
          </svg>
        </>
      )}
    </article>
  )
}
