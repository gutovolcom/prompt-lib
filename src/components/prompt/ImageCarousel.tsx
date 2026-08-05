import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import type { PromptImage } from '../../lib/types'
import { publicImageUrl } from '../../lib/storage'
import { gsap, prefersReducedMotion } from '../../lib/gsap'

interface ImageCarouselProps {
  images: PromptImage[]
  title: string
  /** Notifica quando o lightbox abre/fecha — o dossiê usa para não fechar no Esc. */
  onExpandChange?: (open: boolean) => void
}

// Carousel do detalhe (seção 6.3) — usa as imagens ORIGINAIS. Clicar na
// imagem abre um lightbox em tela cheia para inspecionar o registro.
export function ImageCarousel({ images, title, onExpandChange }: ImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const current = images[index] ?? images[0]
  const imgRef = useRef<HTMLImageElement>(null)

  // Crossfade: some rapidamente, troca o src, e volta a aparecer — em vez
  // da troca abrupta de imagem.
  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.fromTo(imgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' })
  }, [index])

  function setExpandedNotify(open: boolean) {
    setExpanded(open)
    onExpandChange?.(open)
  }

  // Esc fecha só o lightbox: listener em fase de captura + stopPropagation
  // impede que o handler global do dossiê (fase bubble) feche o modal junto.
  useEffect(() => {
    if (!expanded) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setExpanded(false)
        onExpandChange?.(false)
      }
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length)
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [expanded, images.length, onExpandChange])

  if (!current) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-2">
        Sem imagens
      </div>
    )
  }

  const many = images.length > 1
  const arrowClasses =
    'flex h-9 w-9 items-center justify-center rounded-input bg-surface/90 text-text shadow-md transition duration-150 hover:bg-surface'

  return (
    <div className="relative flex h-full min-h-[240px] items-center justify-center bg-surface-2 md:min-h-[300px]">
      <button
        type="button"
        onClick={() => setExpandedNotify(true)}
        aria-label="Ampliar imagem"
        title="Ampliar imagem"
        className="block w-full cursor-zoom-in"
      >
        <img
          ref={imgRef}
          key={current.id}
          src={publicImageUrl(current.storage_path)}
          alt={title}
          className="max-h-[50vh] w-full object-contain md:max-h-[80vh]"
        />
      </button>
      {many && (
        <>
          <button
            type="button"
            aria-label="Imagem anterior"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className={`absolute left-2 top-1/2 -translate-y-1/2 ${arrowClasses}`}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Próxima imagem"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${arrowClasses}`}
          >
            <ChevronRight size={18} aria-hidden />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Ir para imagem ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-1.5 rounded-input transition duration-150 ${
                  i === index ? 'bg-text' : 'bg-text/30'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Lightbox via portal: o painel do modal tem transform (GSAP), o que
          prenderia um position:fixed dentro dele — no body ele cobre a tela. */}
      {expanded &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — imagem ampliada`}
            className="fixed inset-0 z-[70] flex animate-fade-in flex-col items-center justify-center gap-3 bg-[rgba(20,16,8,0.87)] p-4"
            onClick={() => setExpandedNotify(false)}
          >
            <button
              type="button"
              aria-label="Fechar imagem ampliada"
              onClick={() => setExpandedNotify(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-surface/50 text-surface/90 transition duration-150 hover:border-surface hover:text-surface"
            >
              <X size={16} aria-hidden />
            </button>

            <img
              key={current.id}
              src={publicImageUrl(current.storage_path)}
              alt={title}
              className="max-h-[88vh] max-w-[95vw] cursor-zoom-out object-contain shadow-lg"
            />

            <span
              className="font-mono text-[11px] tracking-[0.08em] text-surface/80"
              onClick={(e) => e.stopPropagation()}
            >
              {title}
              {many && ` · registro ${index + 1} de ${images.length}`}
            </span>

            {many && (
              <>
                <button
                  type="button"
                  aria-label="Imagem anterior"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIndex((i) => (i - 1 + images.length) % images.length)
                  }}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${arrowClasses}`}
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Próxima imagem"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIndex((i) => (i + 1) % images.length)
                  }}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${arrowClasses}`}
                >
                  <ChevronRight size={18} aria-hidden />
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}
