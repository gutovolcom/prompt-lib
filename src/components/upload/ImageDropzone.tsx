import { useRef, useState, type DragEvent } from 'react'
import { Star, Trash2, Upload } from 'lucide-react'

export interface LocalImage {
  id: string
  file: File
  previewUrl: string
}

export const MAX_IMAGES = 10
export const MAX_SIZE_BYTES = 15 * 1024 * 1024 // 15MB
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

interface ImageDropzoneProps {
  images: LocalImage[]
  coverId: string | null
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onSelectCover: (id: string) => void
}

// Passo 1 do upload (seção 6.4): dropzone multi-imagem com preview,
// reorder por drag e seleção de capa (primeira por padrão).
export function ImageDropzone({
  images,
  coverId,
  onAdd,
  onRemove,
  onReorder,
  onSelectCover,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragIndex = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragOver(false)
    onAdd(Array.from(event.dataTransfer.files))
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Adicionar imagens"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-10 text-center transition duration-150 ${
          dragOver
            ? 'border-accent bg-accent-soft'
            : 'border-border bg-surface-2/50 hover:bg-surface-2'
        }`}
      >
        <Upload size={28} aria-hidden className="text-text-2" />
        <p className="text-sm font-medium text-text">Arraste imagens aqui ou clique para escolher</p>
        <p className="text-xs text-text-2">
          PNG, JPG ou WebP · máx. {MAX_IMAGES} imagens · acima de 15MB são convertidas para WebP
          automaticamente
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            onAdd(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => {
            const isCover = image.id === coverId
            return (
              <li
                key={image.id}
                draggable
                onDragStart={() => {
                  dragIndex.current = index
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (dragIndex.current !== null && dragIndex.current !== index) {
                    onReorder(dragIndex.current, index)
                  }
                  dragIndex.current = null
                }}
                className={`group relative cursor-grab overflow-hidden rounded-input border ${
                  isCover ? 'border-accent' : 'border-border'
                }`}
              >
                <img
                  src={image.previewUrl}
                  alt={image.file.name}
                  className="aspect-square w-full object-cover"
                />
                {isCover && (
                  <span className="absolute left-1.5 top-1.5 rounded-pill bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                    Capa
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  {!isCover && (
                    <button
                      type="button"
                      title="Definir como capa"
                      aria-label={`Definir ${image.file.name} como capa`}
                      onClick={() => onSelectCover(image.id)}
                      className="rounded-pill bg-black/60 p-1.5 text-white hover:bg-black/80"
                    >
                      <Star size={13} aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Remover"
                    aria-label={`Remover ${image.file.name}`}
                    onClick={() => onRemove(image.id)}
                    className="rounded-pill bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <Trash2 size={13} aria-hidden />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
