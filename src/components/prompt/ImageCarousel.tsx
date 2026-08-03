import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PromptImage } from '../../lib/types'
import { publicImageUrl } from '../../lib/storage'

interface ImageCarouselProps {
  images: PromptImage[]
  title: string
}

// Carousel do detalhe (seção 6.3) — usa as imagens ORIGINAIS.
export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0]

  if (!current) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-muted">
        Sem imagens
      </div>
    )
  }

  const many = images.length > 1

  return (
    <div className="relative flex h-full min-h-[240px] items-center justify-center bg-black/40 md:min-h-[300px]">
      <img
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
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-pill bg-black/60 p-2 text-white transition duration-150 hover:bg-black/80"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Próxima imagem"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-pill bg-black/60 p-2 text-white transition duration-150 hover:bg-black/80"
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
                  i === index ? 'bg-accent' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
