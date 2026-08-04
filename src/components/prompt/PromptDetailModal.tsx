import { useEffect, useState } from 'react'
import { Link, useMatch, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Copy as CopyIcon,
  Download,
  Heart,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { useDeletePrompt, usePrompt } from '../../hooks/usePrompts'
import { useAuth } from '../../hooks/useAuth'
import { publicImageUrl } from '../../lib/storage'
import type { PromptImage } from '../../lib/types'
import { AnimatedModal } from '../ui/AnimatedModal'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useToast } from '../ui/Toast'
import { CopyButton } from './CopyButton'
import { EditPromptModal } from './EditPromptModal'
import { ImageCarousel } from './ImageCarousel'

// Modal de detalhe deep-linkável em /p/:id (seções 6.2/6.3 da spec).
// Fica sempre montado no layout protegido (como o UploadModal) e deriva
// a visibilidade da rota via `useMatch`, para poder animar a saída antes
// de desmontar de fato — ao contrário de ser montado/desmontado pela rota.
export function PromptDetailModal() {
  const match = useMatch('/p/:id')
  const open = Boolean(match)
  const navigate = useNavigate()

  // Mantém o último id visível durante a animação de saída (a rota já
  // mudou pra "/" nesse momento, então `match` já é null).
  const [displayId, setDisplayId] = useState<string | undefined>(match?.params.id)
  useEffect(() => {
    if (match?.params.id) setDisplayId(match.params.id)
  }, [match?.params.id])

  const { data: prompt, isLoading, isError } = usePrompt(displayId)
  const { showToast } = useToast()
  const { user } = useAuth()
  const deletePrompt = useDeletePrompt()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const isAuthor = Boolean(prompt && user && prompt.author_id === user.id)

  async function handleDelete() {
    if (!prompt) return
    try {
      await deletePrompt.mutateAsync(prompt)
      navigate('/')
    } catch {
      setConfirmingDelete(false)
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Esc fecha o detalhe apenas se nenhum modal filho estiver aberto.
      if (event.key === 'Escape' && !editing && !confirmingDelete) navigate('/')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, editing, confirmingDelete])

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
    <>
      <AnimatedModal
        open={open}
        ariaLabel={prompt?.title ?? 'Detalhe do prompt'}
        panelClassName="grid max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-card bg-surface shadow-lg md:grid-cols-2 md:overflow-hidden"
        onBackdropClick={() => navigate('/')}
      >
        <>
          <button
          type="button"
          aria-label="Fechar"
          onClick={() => navigate('/')}
          className="absolute right-3 top-3 z-20 rounded-pill bg-surface/90 p-2 text-text shadow-md transition duration-150 hover:bg-surface"
        >
          <X size={16} aria-hidden />
        </button>

        {isLoading && (
          <div className="col-span-full flex h-64 items-center justify-center text-sm text-text-2">
            Carregando...
          </div>
        )}

        {isError && (
          <div className="col-span-full flex h-64 items-center justify-center text-sm text-text-2">
            Prompt não encontrado.
          </div>
        )}

        {prompt && (
          <>
            <ImageCarousel images={prompt.images} title={prompt.title} />

            <div className="flex flex-col gap-4 p-6 sm:p-8 md:max-h-[90vh] md:overflow-y-auto">
              <h2 className="text-2xl font-bold tracking-tight">{prompt.title}</h2>

              <div className="flex items-center gap-2">
                <Link
                  to={`/perfil/${prompt.author.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Avatar name={prompt.author.name} avatarUrl={prompt.author.avatar_url} size={28} />
                  <span className="text-sm text-text">{prompt.author.name}</span>
                </Link>
                <span className="text-xs text-text-2">
                  · {new Date(prompt.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {prompt.categories.map(({ category }) => (
                  <Badge key={category.id} variant="neutral">
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden
                    />
                    {category.name}
                  </Badge>
                ))}
                <Badge variant="dark">{prompt.model}</Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-2">
                <span className="inline-flex items-center gap-1">
                  <CopyIcon size={13} aria-hidden /> copiado {prompt.copy_count}x
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart size={13} aria-hidden /> {favoritesCount}x
                </span>
              </div>

              <div>
                <h3 className="mb-1.5 text-sm font-semibold text-text">Prompt</h3>
                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-input bg-surface-2 p-4 font-mono text-[13px] leading-relaxed text-text">
                  {prompt.prompt_text}
                </pre>
                <div className="mt-2">
                  <CopyButton promptId={prompt.id} promptText={prompt.prompt_text} size="lg" />
                </div>
              </div>

              {prompt.negative_prompt && (
                <details className="group rounded-input bg-surface-2 p-4">
                  <summary className="flex list-none cursor-pointer items-center justify-between text-sm font-semibold text-text-2">
                    Negative prompt
                    <ChevronDown
                      size={16}
                      aria-hidden
                      className="transition-transform duration-150 group-open:rotate-180"
                    />
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-[13px] text-text-2">
                    {prompt.negative_prompt}
                  </pre>
                </details>
              )}

              {Object.keys(prompt.params).length > 0 && (
                <details className="group rounded-input bg-surface-2 p-4">
                  <summary className="flex list-none cursor-pointer items-center justify-between text-sm font-semibold text-text-2">
                    Parâmetros
                    <ChevronDown
                      size={16}
                      aria-hidden
                      className="transition-transform duration-150 group-open:rotate-180"
                    />
                  </summary>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                    {Object.entries(prompt.params).map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="font-medium text-text-2">{key}</dt>
                        <dd className="text-text">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}

              {prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {cover && (
                  <Button type="button" variant="outline" onClick={() => downloadOriginal(cover)}>
                    <Download size={15} aria-hidden />
                    Baixar imagem original
                  </Button>
                )}
                {isAuthor && (
                  <>
                    <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                      <Pencil size={15} aria-hidden />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-accent"
                      onClick={() => setConfirmingDelete(true)}
                    >
                      <Trash2 size={15} aria-hidden />
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        </>
      </AnimatedModal>

      {prompt && (
        <EditPromptModal prompt={prompt} open={editing} onClose={() => setEditing(false)} />
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir prompt?"
        description={`"${prompt?.title ?? ''}" e suas imagens serão removidos permanentemente. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deletePrompt.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  )
}
