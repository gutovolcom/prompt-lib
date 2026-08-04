import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import type { PromptImage } from '../../lib/types'
import { publicImageUrl } from '../../lib/storage'
import { gsap, prefersReducedMotion } from '../../lib/gsap'

interface ImageCarouselProps {
  images: PromptImage[]
  title: string
}

// Carousel do detalhe (seção 6.3) — usa as imagens ORIGINAIS.
export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0]
  const imgRef = useRef<HTMLImageElement>(null)

  // Crossfade: some rapidamente, troca o src, e volta a aparecer — em vez
  // da troca abrupta de imagem.
  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.fromTo(imgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' })
  }, [index])

  if (!current) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-2">
        Sem imagens
      </div>
    )
  }

  const many = images.length > 1

  return (
    <div className="relative flex h-full min-h-[240px] items-center justify-center bg-surface-2 md:min-h-[300px]">
      <img
        ref={imgRef}
        key={current.id}
        src={publicImageUrl(current.storage_path)}
        alt={title}
        className="max-h-[50vh] w-full object-contain md:max-h-[80vh]"
      />
      {many && (
        <>
          <button
            type="button"
            aria-label="Imagem anterior"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-pill bg-surface/90 text-text shadow-md transition duration-150 hover:bg-surface"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Próxima imagem"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-pill bg-surface/90 text-text shadow-md transition duration-150 hover:bg-surface"
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
                className={`h-1.5 w-1.5 rounded-pill transition duration-150 ${
                  i === index ? 'bg-text' : 'bg-text/30'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
