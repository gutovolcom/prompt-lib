import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { thumbPath } from '../lib/storage'
import { useAuth } from './useAuth'

export interface UploadImageInput {
  /** id local (preview) — usado para rastrear status por imagem */
  id: string
  file: File
  isCover: boolean
  sortOrder: number
}

export interface NewPromptData {
  title: string
  promptText: string
  negativePrompt: string
  model: string
  params: Record<string, string>
  tags: string[]
  categoryIds: number[]
  images: UploadImageInput[]
}

export type ImageUploadStatus = 'pending' | 'uploading' | 'done' | 'error'

interface ThumbResult {
  width: number
  height: number
  thumb: Blob
}

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

// Thumbnail client-side: canvas, máx 800px no lado maior, webp qualidade 0.85
// (seção 4.2 da spec).
async function generateThumb(file: File): Promise<ThumbResult> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap
  const scale = Math.min(1, 800 / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D não suportado neste navegador.')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const thumb = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar thumbnail.'))),
      'image/webp',
      0.85,
    )
  })
  return { width, height, thumb }
}

interface UseUploadResult {
  /**
   * Cria o prompt (uma única vez) e sobe as imagens. Chamadas subsequentes
   * com os mesmos dados fazem retry apenas das imagens que falharam,
   * sem perder o formulário (seção 6.4 da spec).
   */
  submit: (data: NewPromptData) => Promise<boolean>
  statuses: Record<string, ImageUploadStatus>
  submitting: boolean
  error: string | null
  /** Limpa o estado interno ao fechar o modal / após sucesso. */
  reset: () => void
}

export function useUpload(): UseUploadResult {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [statuses, setStatuses] = useState<Record<string, ImageUploadStatus>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const promptIdRef = useRef<string | null>(null)
  const doneRef = useRef<Set<string>>(new Set())

  const setStatus = useCallback((id: string, status: ImageUploadStatus) => {
    setStatuses((current) => ({ ...current, [id]: status }))
  }, [])

  const uploadImage = useCallback(
    async (promptId: string, authorId: string, image: UploadImageInput) => {
      const ext = EXT_BY_MIME[image.file.type]
      if (!ext) throw new Error(`Formato não suportado: ${image.file.type}`)

      const basePath = `${authorId}/${promptId}/${crypto.randomUUID()}.${ext}`
      const { width, height, thumb } = await generateThumb(image.file)

      const original = await supabase.storage
        .from('prompt-images')
        .upload(basePath, image.file, { contentType: image.file.type })
      if (original.error) throw new Error(original.error.message)

      const thumbUpload = await supabase.storage
        .from('prompt-images')
        .upload(thumbPath(basePath), thumb, { contentType: 'image/webp' })
      if (thumbUpload.error) throw new Error(thumbUpload.error.message)

      const { error: insertError } = await supabase.from('prompt_images').insert({
        prompt_id: promptId,
        storage_path: basePath,
        width,
        height,
        is_cover: image.isCover,
        sort_order: image.sortOrder,
      })
      if (insertError) throw new Error(insertError.message)
    },
    [],
  )

  const submit = useCallback(
    async (data: NewPromptData): Promise<boolean> => {
      if (!user) {
        setError('Sessão expirada. Faça login novamente.')
        return false
      }
      setSubmitting(true)
      setError(null)
      try {
        // 1) Cria o prompt + categorias uma única vez (retry não duplica).
        if (!promptIdRef.current) {
          const { data: created, error: promptError } = await supabase
            .from('prompts')
            .insert({
              author_id: user.id,
              title: data.title,
              prompt_text: data.promptText,
              negative_prompt: data.negativePrompt || null,
              model: data.model,
              params: data.params,
              tags: data.tags,
            })
            .select('id')
            .single()
          if (promptError) throw new Error(promptError.message)

          const promptId = (created as { id: string }).id
          const { error: catsError } = await supabase.from('prompt_categories').insert(
            data.categoryIds.map((categoryId) => ({
              prompt_id: promptId,
              category_id: categoryId,
            })),
          )
          if (catsError) throw new Error(catsError.message)
          promptIdRef.current = promptId
        }

        // 2) Sobe as imagens ainda não concluídas, uma a uma (progresso por imagem).
        const promptId = promptIdRef.current
        let failures = 0
        for (const image of data.images) {
          if (doneRef.current.has(image.id)) continue
          setStatus(image.id, 'uploading')
          try {
            await uploadImage(promptId, user.id, image)
            doneRef.current.add(image.id)
            setStatus(image.id, 'done')
          } catch {
            failures++
            setStatus(image.id, 'error')
          }
        }

        if (failures > 0) {
          setError(
            `${failures} ${failures === 1 ? 'imagem falhou' : 'imagens falharam'} no envio. Tente novamente — o restante já foi salvo.`,
          )
          return false
        }

        await queryClient.invalidateQueries({ queryKey: ['prompts'] })
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado ao publicar.')
        return false
      } finally {
        setSubmitting(false)
      }
    },
    [user, queryClient, setStatus, uploadImage],
  )

  const reset = useCallback(() => {
    promptIdRef.current = null
    doneRef.current = new Set()
    setStatuses({})
    setError(null)
    setSubmitting(false)
  }, [])

  return { submit, statuses, submitting, error, reset }
}
