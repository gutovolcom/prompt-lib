import { useEffect, useRef, useState } from 'react'
import { Link, useMatch, useNavigate } from 'react-router-dom'
import { ChevronDown, Download, Heart, Pencil, Paperclip, Trash2, X } from 'lucide-react'
import { useDeletePrompt, usePrompt } from '../../hooks/usePrompts'
import { useAuth } from '../../hooks/useAuth'
import { publicImageUrl } from '../../lib/storage'
import { catalogCode } from '../../lib/catalog'
import type { PromptImage } from '../../lib/types'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { AnimatedModal } from '../ui/AnimatedModal'
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
//
// Identidade "O Arquivo": o modal é um dossiê de duas páginas — a foto
// à esquerda (com clipe de papel) e a ficha datilografada à direita, com
// a FÓRMULA em destaque. Copiar "estampa" um carimbo sobre a fórmula.
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

  // Trava o scroll do body enquanto o modal está aberto (mesmo padrão do UploadModal).
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const { data: prompt, isLoading, isError } = usePrompt(displayId)
  const { showToast } = useToast()
  const { user } = useAuth()
  const deletePrompt = useDeletePrompt()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const isAuthor = Boolean(prompt && user && prompt.author_id === user.id)

  const sweepRef = useRef<HTMLDivElement>(null)
  const stampRef = useRef<HTMLDivElement>(null)
  const stampTimeline = useRef<ReturnType<typeof gsap.timeline>>()

  // Carimbo "COPIADO": uma varredura de marca-texto sobre a fórmula seguida
  // do carimbo estampando com rotação — o momento de marca do produto.
  function playStamp() {
    if (prefersReducedMotion()) return
    const sweep = sweepRef.current
    const stamp = stampRef.current
    if (!sweep || !stamp) return
    stampTimeline.current?.kill()
    gsap.set(sweep, { scaleX: 0, opacity: 0.55 })
    gsap.set(stamp, { opacity: 0, scale: 2.4 })
    stampTimeline.current = gsap
      .timeline()
      .to(sweep, { scaleX: 1, duration: 0.5, ease: 'power2.out' })
      .to(stamp, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.7)' }, 0.42)
      .to([sweep, stamp], { opacity: 0, duration: 0.4 }, 1.9)
  }

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
      // Esc fecha o detalhe apenas se nenhum modal filho (edição, confirmação
      // ou lightbox de imagem) estiver aberto.
      if (event.key === 'Escape' && !editing && !confirmingDelete && !lightboxOpen) navigate('/')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, editing, confirmingDelete, lightboxOpen])

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
  const code = catalogCode(prompt?.catalog_number)

  return (
    <>
      <AnimatedModal
        open={open}
        ariaLabel={prompt?.title ?? 'Detalhe do prompt'}
        panelClassName="relative grid max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-card border border-border bg-surface shadow-lg md:grid-cols-[1fr_1.15fr] md:overflow-hidden md:bg-[linear-gradient(to_right,transparent_49.7%,rgb(var(--text)/0.14)_50%,transparent_50.4%)]"
        onBackdropClick={() => navigate('/')}
      >
        <>
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => navigate('/')}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-text-muted text-text-2 transition duration-150 hover:border-text hover:text-text"
          >
            <X size={15} aria-hidden />
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
              {/* Página esquerda: a foto presa com clipe + ficha de tiragem */}
              <div className="flex flex-col items-center gap-4 p-8 md:min-h-0 md:overflow-y-auto md:p-9">
                <figure className="relative w-full rotate-[-1deg] bg-surface p-2.5 pb-3.5 shadow-md">
                  <Paperclip
                    aria-hidden
                    size={26}
                    className="absolute -left-1 -top-3 -rotate-[25deg] text-text-muted"
                  />
                  <ImageCarousel
                    images={prompt.images}
                    title={prompt.title}
                    onExpandChange={setLightboxOpen}
                  />
                </figure>
                <span className="text-center font-mono text-[11px] tracking-[0.06em] text-text-2">
                  registro · {prompt.model.toLowerCase()}
                </span>

                <div
                  className="w-full rounded-input border border-paper-line bg-surface-2/50 p-3.5"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, transparent 0 24px, rgb(var(--paper-line)) 24px 25px)',
                  }}
                >
                  <h4 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-text-2">
                    Ficha de tiragem
                  </h4>
                  <dl className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <dt className="text-text-2">cópias do prompt</dt>
                      <dd className="font-bold text-accent">{prompt.copy_count}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-2">favoritado por</dt>
                      <dd>{favoritesCount} colega{favoritesCount === 1 ? '' : 's'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-2">arquivada em</dt>
                      <dd>{new Date(prompt.created_at).toLocaleDateString('pt-BR')}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Página direita: ficha datilografada */}
              <div className="flex flex-col gap-4 border-t border-border p-8 md:min-h-0 md:overflow-y-auto md:border-l-0 md:border-t-0 md:p-9">
                <div className="flex items-center justify-between border-b-2 border-text pb-2.5 font-mono text-[11px] tracking-[0.1em] text-text-2">
                  <span>FICHA · {code}</span>
                  <span className="hidden sm:inline">
                    arquivada em {new Date(prompt.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h2 className="font-display text-[26px] font-bold leading-tight tracking-tight">
                  {prompt.title}
                </h2>

                <p className="font-mono text-xs text-text-2">
                  arquivado por{' '}
                  <Link to={`/perfil/${prompt.author.id}`} className="font-bold text-text hover:underline">
                    {prompt.author.name}
                  </Link>
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  {prompt.categories.map(({ category }) => (
                    <Badge key={category.id} variant="neutral">
                      <span
                        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden
                      />
                      {category.name}
                    </Badge>
                  ))}
                  <Badge variant="dark">{prompt.model}</Badge>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-text-2">
                    <Heart size={12} aria-hidden /> {favoritesCount}
                  </span>
                </div>

                <div>
                  <h3 className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-text-2">
                    Fórmula (datilografada)
                  </h3>
                  <div className="relative overflow-hidden rounded-input border border-text/25 bg-surface-2/60 p-4 shadow-inner">
                    <div
                      ref={sweepRef}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 origin-left bg-[#F5E642]"
                      style={{ transform: 'scaleX(0)', opacity: 0.55 }}
                    />
                    <pre className="relative max-h-56 overflow-y-auto whitespace-pre-wrap font-mono text-[13px] leading-[1.7] text-text">
                      {prompt.prompt_text}
                    </pre>
                    <div
                      ref={stampRef}
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[10deg] rounded-input border-[3px] border-accent bg-surface/70 px-5 py-1.5 font-mono text-xl font-bold uppercase tracking-[0.3em] text-accent"
                      style={{ opacity: 0 }}
                    >
                      Copiado
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <CopyButton
                      promptId={prompt.id}
                      promptText={prompt.prompt_text}
                      size="lg"
                      onCopied={playStamp}
                    />
                  </div>
                </div>

                {prompt.negative_prompt && (
                  <details className="group rounded-input border border-dashed border-text-muted p-4">
                    <summary className="flex list-none cursor-pointer items-center justify-between font-mono text-xs font-bold uppercase tracking-[0.06em] text-text-2">
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
                  <details className="group rounded-input border border-dashed border-text-muted p-4">
                    <summary className="flex list-none cursor-pointer items-center justify-between font-mono text-xs font-bold uppercase tracking-[0.06em] text-text-2">
                      Parâmetros
                      <ChevronDown
                        size={16}
                        aria-hidden
                        className="transition-transform duration-150 group-open:rotate-180"
                      />
                    </summary>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
                      {Object.entries(prompt.params).map(([key, value]) => (
                        <div key={key} className="contents">
                          <dt className="text-text-2">{key}</dt>
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

                <div className="flex flex-wrap gap-2 border-t border-dashed border-border pt-4">
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
