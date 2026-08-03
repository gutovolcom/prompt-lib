import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Camera, Check, Copy as CopyIcon, Heart, Images, Pencil, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthorPrompts, useProfile, useUpdateProfile } from '../hooks/useProfile'
import { Avatar } from '../components/ui/Avatar'
import { PromptGrid } from '../components/gallery/PromptGrid'
import { PromptGridSkeleton } from '../components/gallery/PromptGridSkeleton'

// Página de perfil (seção 6.6): header com contadores, grid dos prompts do
// autor e edição de nome/avatar quando é o perfil próprio.
export function Profile() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(id)
  const { data: prompts, isLoading: promptsLoading } = useAuthorPrompts(id)
  const updateProfile = useUpdateProfile()

  const isOwn = Boolean(user && id === user.id)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  const publishedCount = prompts?.length ?? 0
  const copiesReceived = prompts?.reduce((sum, p) => sum + p.copy_count, 0) ?? 0
  const favoritesReceived =
    prompts?.reduce((sum, p) => sum + (p.favorites?.[0]?.count ?? 0), 0) ?? 0

  function startEditingName() {
    setNameValue(profile?.name ?? '')
    setEditingName(true)
  }

  function saveName() {
    if (nameValue.trim() && nameValue.trim() !== profile?.name) {
      updateProfile.mutate({ name: nameValue })
    }
    setEditingName(false)
  }

  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-10">
      <section className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative shrink-0">
          {profileLoading ? (
            <div className="h-16 w-16 animate-shimmer rounded-full" />
          ) : (
            <Avatar name={profile?.name ?? '?'} avatarUrl={profile?.avatar_url} size={64} />
          )}
          {isOwn && (
            <>
              <button
                type="button"
                title="Trocar avatar"
                aria-label="Trocar avatar"
                onClick={() => avatarInputRef.current?.click()}
                disabled={updateProfile.isPending}
                className="absolute -bottom-1 -right-1 rounded-pill bg-surface p-2 text-text-2 shadow-md transition duration-150 hover:text-text disabled:opacity-50"
              >
                <Camera size={14} aria-hidden />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) updateProfile.mutate({ avatarFile: file })
                  e.target.value = ''
                }}
              />
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 sm:items-start">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                aria-label="Nome"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                autoFocus
                className="rounded-pill border border-transparent bg-surface-2 px-4 py-1.5 text-lg font-bold text-text focus:border-accent focus:bg-surface focus:outline-none"
              />
              <button
                type="button"
                aria-label="Salvar nome"
                onClick={saveName}
                className="rounded-pill p-1.5 text-text-2 hover:text-text"
              >
                <Check size={16} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Cancelar edição do nome"
                onClick={() => setEditingName(false)}
                className="rounded-pill p-1.5 text-text-2 hover:text-text"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {profileLoading ? '...' : (profile?.name ?? 'Perfil não encontrado')}
              </h1>
              {isOwn && (
                <button
                  type="button"
                  title="Editar nome"
                  aria-label="Editar nome"
                  onClick={startEditingName}
                  className="rounded-pill p-1.5 text-text-2 transition duration-150 hover:text-text"
                >
                  <Pencil size={14} aria-hidden />
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-2">
            <span className="inline-flex items-center gap-1.5">
              <Images size={14} aria-hidden />
              <span className="font-semibold text-text">{publishedCount}</span>{' '}
              {publishedCount === 1 ? 'prompt' : 'prompts'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CopyIcon size={14} aria-hidden />
              copiado <span className="font-semibold text-text">{copiesReceived}</span>x
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart size={14} aria-hidden />
              <span className="font-semibold text-text">{favoritesReceived}</span>x
            </span>
          </div>
        </div>
      </section>

      {promptsLoading && <PromptGridSkeleton />}

      {!promptsLoading && publishedCount === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface-2/50 px-8 py-16 text-center">
          <p className="text-sm text-text-2">
            {isOwn ? 'Você ainda não publicou nenhum prompt.' : 'Nenhum prompt publicado ainda.'}
          </p>
        </div>
      )}

      {!promptsLoading && prompts && publishedCount > 0 && <PromptGrid prompts={prompts} />}
    </main>
  )
}
