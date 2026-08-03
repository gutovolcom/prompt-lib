import { useOutletContext } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import type { AppOutletContext } from '../App'
import { usePrompts } from '../hooks/usePrompts'
import { PromptGrid } from '../components/gallery/PromptGrid'
import { Button } from '../components/ui/Button'

export function Gallery() {
  const { openUpload } = useOutletContext<AppOutletContext>()
  const { data: prompts, isLoading, isError } = usePrompts()

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-text-muted">
        Carregando prompts...
      </main>
    )
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-text-muted">
        Erro ao carregar os prompts. Recarregue a página.
      </main>
    )
  }

  if (!prompts || prompts.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border bg-surface px-8 py-20 text-center">
          <ImagePlus size={40} aria-hidden className="text-text-muted" />
          <h2 className="text-lg font-semibold">Nenhum prompt por aqui ainda</h2>
          <p className="max-w-sm text-sm text-text-muted">
            A biblioteca está vazia. Compartilhe o primeiro prompt de imagem que deu certo para o
            time reutilizar.
          </p>
          <Button type="button" onClick={openUpload}>
            Suba o primeiro prompt
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <PromptGrid prompts={prompts} />
    </main>
  )
}
