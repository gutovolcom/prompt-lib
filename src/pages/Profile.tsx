import { useParams } from 'react-router-dom'

export function Profile() {
  const { id } = useParams<{ id: string }>()

  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      {/* Placeholder — página de perfil completa chega na Fase 4 */}
      <div className="rounded-card border border-dashed border-border bg-surface px-8 py-20 text-center">
        <h2 className="text-lg font-semibold">Perfil</h2>
        <p className="mt-2 text-sm text-text-muted">
          O perfil {id ? `(${id.slice(0, 8)}…)` : ''} e seus prompts publicados aparecerão aqui em
          breve.
        </p>
      </div>
    </main>
  )
}
