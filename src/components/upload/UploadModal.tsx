import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { MODEL_OPTIONS } from '../../lib/config'
import { compressToWebp } from '../../lib/image'
import { useCategories } from '../../hooks/usePrompts'
import { useUpload, type NewPromptData } from '../../hooks/useUpload'
import { AnimatedModal } from '../ui/AnimatedModal'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { useToast } from '../ui/Toast'
import {
  ACCEPTED_TYPES,
  ImageDropzone,
  MAX_IMAGES,
  MAX_SIZE_BYTES,
  type LocalImage,
} from './ImageDropzone'

interface UploadModalProps {
  open: boolean
  onClose: () => void
}

interface ParamRow {
  key: string
  value: string
}

const OTHER_MODEL = '__outro__'

// Modal "Novo prompt" em 2 passos (seção 6.4 da spec).
export function UploadModal({ open, onClose }: UploadModalProps) {
  const { data: categories } = useCategories()
  const { submit, statuses, submitting, error: uploadError, reset } = useUpload()
  const { showToast } = useToast()

  const [step, setStep] = useState<1 | 2>(1)
  const [images, setImages] = useState<LocalImage[]>([])
  const [coverId, setCoverId] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [optimizing, setOptimizing] = useState(false)

  const [title, setTitle] = useState('')
  const [promptText, setPromptText] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [modelChoice, setModelChoice] = useState<string>(MODEL_OPTIONS[0])
  const [customModel, setCustomModel] = useState('')
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [paramRows, setParamRows] = useState<ParamRow[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [hadFailure, setHadFailure] = useState(false)

  // Trava o scroll do body enquanto o modal está aberto.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function resetAll() {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setStep(1)
    setImages([])
    setCoverId(null)
    setImageError(null)
    setTitle('')
    setPromptText('')
    setNegativePrompt('')
    setModelChoice(MODEL_OPTIONS[0])
    setCustomModel('')
    setCategoryIds([])
    setTags([])
    setTagInput('')
    setParamRows([])
    setFormError(null)
    setHadFailure(false)
    reset()
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function addImages(files: File[]) {
    setImageError(null)
    setOptimizing(true)
    const accepted: LocalImage[] = []
    try {
      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setImageError(`"${file.name}" não é PNG, JPG ou WebP.`)
          continue
        }
        let finalFile = file
        if (file.size > MAX_SIZE_BYTES) {
          // Acima do limite: converte para WebP em alta qualidade no navegador,
          // mantendo a resolução original.
          try {
            finalFile = await compressToWebp(file, MAX_SIZE_BYTES)
          } catch (err) {
            setImageError(err instanceof Error ? err.message : `Falha ao otimizar "${file.name}".`)
            continue
          }
        }
        accepted.push({
          id: crypto.randomUUID(),
          file: finalFile,
          previewUrl: URL.createObjectURL(finalFile),
        })
      }
    } finally {
      setOptimizing(false)
    }
    setImages((current) => {
      const merged = [...current, ...accepted].slice(0, MAX_IMAGES)
      if (current.length + accepted.length > MAX_IMAGES) {
        setImageError(`Máximo de ${MAX_IMAGES} imagens por prompt.`)
      }
      // Capa: primeira por padrão
      setCoverId((cover) => cover ?? merged[0]?.id ?? null)
      return merged
    })
  }

  function removeImage(id: string) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      const next = current.filter((image) => image.id !== id)
      setCoverId((cover) => (cover === id ? (next[0]?.id ?? null) : cover))
      return next
    })
  }

  function reorderImages(fromIndex: number, toIndex: number) {
    setImages((current) => {
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      if (moved) next.splice(toIndex, 0, moved)
      return next
    })
  }

  function addTagFromInput() {
    const value = tagInput.trim().replace(/,+$/, '')
    if (value && !tags.includes(value)) setTags((current) => [...current, value])
    setTagInput('')
  }

  function toggleCategory(id: number) {
    setCategoryIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    )
  }

  const resolvedModel = modelChoice === OTHER_MODEL ? customModel.trim() : modelChoice

  // Regras da seção 8: ≥1 imagem, ≥1 categoria, título, prompt_text e modelo.
  function validate(): string | null {
    if (images.length === 0) return 'Adicione pelo menos 1 imagem.'
    if (!title.trim()) return 'Informe o título.'
    if (!promptText.trim()) return 'Informe o texto do prompt.'
    if (!resolvedModel) return 'Informe o modelo.'
    if (categoryIds.length === 0) return 'Selecione pelo menos 1 categoria.'
    return null
  }

  async function handleSubmit() {
    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError(null)

    const params: Record<string, string> = {}
    for (const row of paramRows) {
      if (row.key.trim() && row.value.trim()) params[row.key.trim()] = row.value.trim()
    }

    const data: NewPromptData = {
      title: title.trim(),
      promptText: promptText.trim(),
      negativePrompt: negativePrompt.trim(),
      model: resolvedModel,
      params,
      tags,
      categoryIds,
      images: images.map((image, index) => ({
        id: image.id,
        file: image.file,
        isCover: image.id === coverId,
        sortOrder: index,
      })),
    }

    const ok = await submit(data)
    if (ok) {
      showToast('Prompt publicado')
      onClose()
    } else {
      setHadFailure(true)
    }
  }

  const step1Valid = images.length > 0

  return (
    <AnimatedModal
      open={open}
      onExited={resetAll}
      ariaLabel="Novo prompt"
      panelClassName="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-border bg-surface shadow-lg"
      onBackdropClick={handleClose}
    >
      <>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold tracking-tight">
            Novo prompt{' '}
            <span className="ml-2 text-xs font-normal text-text-2">
              Passo {step} de 2 · {step === 1 ? 'Imagens' : 'Detalhes'}
            </span>
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={handleClose}
            className="rounded-input p-1.5 text-text-2 transition duration-150 hover:bg-surface-2 hover:text-text"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <ImageDropzone
                images={images}
                coverId={coverId}
                onAdd={addImages}
                onRemove={removeImage}
                onReorder={reorderImages}
                onSelectCover={setCoverId}
              />
              {optimizing && (
                <p className="flex items-center gap-2 text-sm text-text-2">
                  <Loader2 size={14} aria-hidden className="animate-spin" />
                  Otimizando imagens grandes...
                </p>
              )}
              {imageError && (
                <p role="alert" className="text-sm text-danger">
                  {imageError}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <Input
                label="Título *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Policial federal em pose heroica"
              />

              <Textarea
                label="Prompt *"
                rows={6}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Cole aqui o prompt exato usado na geração"
                className="font-mono text-xs"
              />

              <Textarea
                label="Negative prompt"
                rows={2}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="font-mono text-xs"
              />

              <Field label="Modelo *">
                <div className="flex gap-2">
                  <Select
                    aria-label="Modelo"
                    value={modelChoice}
                    onChange={(e) => setModelChoice(e.target.value)}
                    className="flex-1"
                  >
                    {MODEL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    <option value={OTHER_MODEL}>Outro...</option>
                  </Select>
                  {modelChoice === OTHER_MODEL && (
                    <input
                      aria-label="Nome do modelo"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="Nome do modelo"
                      className="flex-1 rounded-input border border-transparent bg-surface-2 px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:bg-surface focus:outline-none"
                    />
                  )}
                </div>
              </Field>

              <Field label="Categorias * (mín. 1)">
                <div className="flex flex-wrap gap-1.5">
                  {(categories ?? []).map((category) => {
                    const active = categoryIds.includes(category.id)
                    return (
                      <button
                        key={category.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleCategory(category.id)}
                        className={`rounded-input border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.04em] transition duration-150 ${
                          active
                            ? 'border-transparent text-white'
                            : 'border-border bg-surface-2 text-text-2 hover:border-text hover:text-text'
                        }`}
                        style={active ? { backgroundColor: category.color } : undefined}
                      >
                        {category.name}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field label="Tags">
                <div className="flex flex-wrap items-center gap-1.5 rounded-input bg-surface-2 px-3 py-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-input bg-surface px-2 py-0.5 text-xs shadow-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        aria-label={`Remover tag ${tag}`}
                        onClick={() => setTags((current) => current.filter((t) => t !== tag))}
                        className="text-text-2 hover:text-text"
                      >
                        <X size={11} aria-hidden />
                      </button>
                    </span>
                  ))}
                  <input
                    id="tag-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        addTagFromInput()
                      }
                    }}
                    onBlur={addTagFromInput}
                    placeholder={tags.length === 0 ? 'Digite e pressione Enter' : ''}
                    className="min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-sm text-text placeholder:text-text-muted focus:outline-none"
                  />
                </div>
              </Field>

              <Field label="Parâmetros (aspect ratio, seed, steps...)">
                <div className="flex flex-col gap-2">
                  {paramRows.map((row, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        aria-label="Nome do parâmetro"
                        value={row.key}
                        onChange={(e) =>
                          setParamRows((current) =>
                            current.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)),
                          )
                        }
                        placeholder="chave"
                        className="w-1/3 rounded-input border border-transparent bg-surface-2 px-4 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:bg-surface focus:outline-none"
                      />
                      <input
                        aria-label="Valor do parâmetro"
                        value={row.value}
                        onChange={(e) =>
                          setParamRows((current) =>
                            current.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)),
                          )
                        }
                        placeholder="valor"
                        className="flex-1 rounded-input border border-transparent bg-surface-2 px-4 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:bg-surface focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Remover parâmetro"
                        onClick={() =>
                          setParamRows((current) => current.filter((_, i) => i !== index))
                        }
                        className="rounded-input px-2 text-text-2 hover:text-text"
                      >
                        <X size={14} aria-hidden />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setParamRows((current) => [...current, { key: '', value: '' }])}
                    className="self-start text-xs text-text-2 underline-offset-2 hover:text-text hover:underline"
                  >
                    + adicionar parâmetro
                  </button>
                </div>
              </Field>

              {/* Progresso por imagem durante o envio / após falha parcial */}
              {(submitting || hadFailure) && (
                <ul className="flex flex-col gap-1 rounded-input bg-surface-2 p-3">
                  {images.map((image) => {
                    const status = statuses[image.id] ?? 'pending'
                    return (
                      <li key={image.id} className="flex items-center gap-2 text-xs">
                        {status === 'done' && (
                          <CheckCircle2 size={13} aria-hidden className="text-success" />
                        )}
                        {status === 'error' && (
                          <AlertCircle size={13} aria-hidden className="text-danger" />
                        )}
                        {status === 'uploading' && (
                          <Loader2 size={13} aria-hidden className="animate-spin text-text-2" />
                        )}
                        {status === 'pending' && (
                          <span className="inline-block h-[13px] w-[13px] rounded-input border border-border" />
                        )}
                        <span className="truncate text-text-2">{image.file.name}</span>
                      </li>
                    )
                  })}
                </ul>
              )}

              {(formError ?? uploadError) && (
                <p role="alert" className="text-sm text-danger">
                  {formError ?? uploadError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {step === 1 ? (
            <>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="button" disabled={!step1Valid || optimizing} onClick={() => setStep(2)}>
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting || hadFailure}
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
                {submitting ? 'Publicando...' : hadFailure ? 'Tentar novamente' : 'Publicar'}
              </Button>
            </>
          )}
        </div>
      </>
    </AnimatedModal>
  )
}
