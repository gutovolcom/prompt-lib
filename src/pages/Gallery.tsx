import { ImagePlus } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function Gallery() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      {/* Empty state — a listagem real chega na Fase 2 */}
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border bg-surface px-8 py-20 text-center">
        <ImagePlus size={40} aria-hidden className="text-text-muted" />
        <h2 className="text-lg font-semibold">Nenhum prompt por aqui ainda</h2>
        <p className="max-w-sm text-sm text-text-muted">
          A biblioteca está vazia. Compartilhe o primeiro prompt de imagem que deu certo para o
          time reutilizar.
        </p>
        {/* Abre o modal de upload na Fase 2 */}
        <Button type="button">Suba o primeiro prompt</Button>
      </div>
    </main>
  )
}
