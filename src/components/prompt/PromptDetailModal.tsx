import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Copy as CopyIcon, Download, Heart, X } from 'lucide-react'
import { usePrompt } from '../../hooks/usePrompts'
import { publicImageUrl } from '../../lib/storage'
import type { PromptImage } from '../../lib/types'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { useToast } from '../ui/Toast'
import { CopyButton } from './CopyButton'
import { ImageCarousel } from './ImageCarousel'

// Modal de detalhe deep-linkável em /p/:id (seções 6.2/6.3 da spec).
// Renderizado por cima da galeria; fechar volta para /.
export function PromptDetailModal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: prompt, isLoading, isError } = usePrompt(id)
  const { showToast } = useToast()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  async function downloadOriginal(image: PromptImage) {
    try {
      const response = await fetch(publicImageUrl(image.storage_path))
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = image.storage_path.split('/').pop() ?? 'imagem'
      anchor.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      showToast('Não foi possível baixar a imagem.')
    }
  }

  const favoritesCount = prompt?.favorites?.[0]?.count ?? 0
  const cover = prompt?.images.find((image) => image.is_cover) ?? prompt?.images[0]

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={prompt?.title ?? 'Detalhe do prompt'}
    >
      <div className="absolute inset-0 bg-black/70" onClick={() => navigate('/')} />

      <div className="relative z-10 grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-card border border-border bg-surface md:grid-cols-2">
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => navigate('/')}
          className="absolute right-3 top-3 z-20 rounded-pill bg-black/60 p-2 text-white transition duration-150 hover:bg-black/80"
        >
          <X size={16} aria-hidden />
        </button>

        {isLoading && (
          <div className="col-span-full flex h-64 items-center justify-center text-sm text-text-muted">
            Carregando...
          </div>
        )}

        {isError && (
          <div className="col-span-full flex h-64 items-center justify-center text-sm text-text-muted">
            Prompt não encontrado.
          </div>
        )}

        {prompt && (
          <>
            <ImageCarousel images={prompt.images} title={prompt.title} />

            <div className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto p-6">
              <h2 className="text-lg font-semibold">{prompt.title}</h2>

              <div className="flex items-center gap-2">
                <Link
                  to={`/perfil/${prompt.author.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Avatar name={prompt.author.name} avatarUrl={prompt.author.avatar_url} size={28} />
                  <span className="text-sm">{prompt.author.name}</span>
                </Link>
                <span className="text-xs text-text-muted">
                  · {new Date(prompt.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {prompt.categories.map(({ category }) => (
                  <Badge key={category.id} color={category.color}>
                    {category.name}
                  </Badge>
                ))}
                <Badge>{prompt.model}</Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <CopyIcon size={13} aria-hidden /> copiado {prompt.copy_count}x
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart size={13} aria-hidden /> {favoritesCount}x
                </span>
              </div>

              <div>
                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-input border border-border bg-surface-2 p-3 font-mono text-xs leading-relaxed text-text">
                  {prompt.prompt_text}
                </pre>
                <div className="mt-2">
                  <CopyButton promptId={prompt.id} promptText={prompt.prompt_text} size="lg" />
                </div>
              </div>

              {prompt.negative_prompt && (
                <details className="rounded-input border border-border bg-surface-2 p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Negative prompt
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-text-muted">
                    {prompt.negative_prompt}
                  </pre>
                </details>
              )}

              {Object.keys(prompt.params).length > 0 && (
                <details className="rounded-input border border-border bg-surface-2 p-3">
                  <summary className="cursor-pointer text-sm font-medium">Parâmetros</summary>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                    {Object.entries(prompt.params).map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="font-medium text-text-muted">{key}</dt>
                        <dd className="text-text">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}

              {prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((tag) => (
                    <Badge key={tag}>#{tag}</Badge>
                  ))}
                </div>
              )}

              {cover && (
                <button
                  type="button"
                  onClick={() => downloadOriginal(cover)}
                  className="inline-flex items-center gap-2 self-start rounded-input border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text transition duration-150 hover:bg-border"
                >
                  <Download size={15} aria-hidden />
                  Baixar imagem original
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
