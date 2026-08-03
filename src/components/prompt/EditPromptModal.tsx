import { useState } from 'react'
import { X } from 'lucide-react'
import { MODEL_OPTIONS } from '../../lib/config'
import type { PromptWithRelations } from '../../lib/types'
import { useCategories, useUpdatePrompt } from '../../hooks/usePrompts'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface EditPromptModalProps {
  prompt: PromptWithRelations
  onClose: () => void
}

const OTHER_MODEL = '__outro__'
const FIXED_MODELS: readonly string[] = MODEL_OPTIONS

// Edição de metadados do próprio prompt (seção 6.3). Imagens não são
// editáveis no MVP — exclua e republique se precisar trocá-las.
export function EditPromptModal({ prompt, onClose }: EditPromptModalProps) {
  const { data: categories } = useCategories()
  const updatePrompt = useUpdatePrompt()

  const isFixedModel = FIXED_MODELS.includes(prompt.model)
  const [title, setTitle] = useState(prompt.title)
  const [promptText, setPromptText] = useState(prompt.prompt_text)
  const [negativePrompt, setNegativePrompt] = useState(prompt.negative_prompt ?? '')
  const [modelChoice, setModelChoice] = useState(isFixedModel ? prompt.model : OTHER_MODEL)
  const [customModel, setCustomModel] = useState(isFixedModel ? '' : prompt.model)
  const [categoryIds, setCategoryIds] = useState<number[]>(
    prompt.categories.map(({ category }) => category.id),
  )
  const [tags, setTags] = useState<string[]>(prompt.tags)
  const [tagInput, setTagInput] = useState('')
  const [paramRows, setParamRows] = useState<{ key: string; value: string }[]>(
    Object.entries(prompt.params).map(([key, value]) => ({ key, value: String(value) })),
  )
  const [formError, setFormError] = useState<string | null>(null)

  const resolvedModel = modelChoice === OTHER_MODEL ? customModel.trim() : modelChoice

  function toggleCategory(id: number) {
    setCategoryIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    )
  }

  function addTagFromInput() {
    const value = tagInput.trim().replace(/,+$/, '')
    if (value && !tags.includes(value)) setTags((current) => [...current, value])
    setTagInput('')
  }

  async function handleSave() {
    if (!title.trim()) return setFormError('Informe o título.')
    if (!promptText.trim()) return setFormError('Informe o texto do prompt.')
    if (!resolvedModel) return setFormError('Informe o modelo.')
    if (categoryIds.length === 0) return setFormError('Selecione pelo menos 1 categoria.')
    setFormError(null)

    const params: Record<string, string> = {}
    for (const row of paramRows) {
      if (row.key.trim() && row.value.trim()) params[row.key.trim()] = row.value.trim()
    }

    try {
      await updatePrompt.mutateAsync({
        id: prompt.id,
        title: title.trim(),
        promptText: promptText.trim(),
        negativePrompt: negativePrompt.trim(),
        model: resolvedModel,
        params,
        tags,
        categoryIds,
      })
      onClose()
    } catch {
      // Toast de erro já emitido pelo hook; mantém o formulário aberto.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Editar ${prompt.title}`}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Editar prompt</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-pill p-1.5 text-text-muted transition duration-150 hover:bg-surface-2 hover:text-text"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <p className="rounded-input border border-border bg-surface-2 px-3 py-2 text-xs text-text-muted">
            As imagens não podem ser alteradas na edição — para trocá-las, exclua o prompt e
            publique novamente.
          </p>

          <Input label="Título *" value={title} onChange={(e) => setTitle(e.target.value)} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-prompt-text" className="text-sm font-medium text-text-muted">
              Prompt *
            </label>
            <textarea
              id="edit-prompt-text"
              rows={6}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="rounded-input border border-border bg-surface-2 px-3 py-2 font-mono text-xs leading-relaxed text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-negative" className="text-sm font-medium text-text-muted">
              Negative prompt
            </label>
            <textarea
              id="edit-negative"
              rows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="rounded-input border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-model" className="text-sm font-medium text-text-muted">
              Modelo *
            </label>
            <div className="flex gap-2">
              <select
                id="edit-model"
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="flex-1 rounded-input border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
              >
                {MODEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value={OTHER_MODEL}>Outro...</option>
              </select>
              {modelChoice === OTHER_MODEL && (
                <input
                  aria-label="Nome do modelo"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Nome do modelo"
                  className="flex-1 rounded-input border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-muted">Categorias * (mín. 1)</span>
            <div className="flex flex-wrap gap-1.5">
              {(categories ?? []).map((category) => {
                const active = categoryIds.includes(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCategory(category.id)}
                    className={`rounded-pill border px-3 py-1 text-xs font-medium transition duration-150 ${
                      active
                        ? 'border-transparent text-white'
                        : 'border-border bg-surface-2 text-text-muted hover:text-text'
                    }`}
                    style={active ? { backgroundColor: category.color } : undefined}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-tags" className="text-sm font-medium text-text-muted">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-input border border-border bg-surface-2 px-2 py-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-pill bg-surface px-2 py-0.5 text-xs"
                >
                  #{tag}
                  <button
                    type="button"
                    aria-label={`Remover tag ${tag}`}
                    onClick={() => setTags((current) => current.filter((t) => t !== tag))}
                    className="text-text-muted hover:text-text"
                  >
                    <X size={11} aria-hidden />
                  </button>
                </span>
              ))}
              <input
                id="edit-tags"
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
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-muted">Parâmetros</span>
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
                  className="w-1/3 rounded-input border border-border bg-surface-2 px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
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
                  className="flex-1 rounded-input border border-border bg-surface-2 px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Remover parâmetro"
                  onClick={() => setParamRows((current) => current.filter((_, i) => i !== index))}
                  className="rounded-input px-2 text-text-muted hover:text-text"
                >
                  <X size={14} aria-hidden />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setParamRows((current) => [...current, { key: '', value: '' }])}
              className="self-start text-xs text-text-muted underline-offset-2 hover:text-text hover:underline"
            >
              + adicionar parâmetro
            </button>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-accent">
              {formError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" disabled={updatePrompt.isPending} onClick={() => void handleSave()}>
            {updatePrompt.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </div>
  )
}
