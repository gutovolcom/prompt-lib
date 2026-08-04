import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { SearchBar } from './SearchBar'

interface HeaderProps {
  onNewPrompt: () => void
}

export function Header({ onNewPrompt }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const navigate = useNavigate()

  const displayName =
    profile?.name ??
    (user?.user_metadata['name'] as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Usuário'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="relative mx-auto flex h-20 max-w-[1440px] items-center px-6">
        <Link to="/" className="z-10 shrink-0 text-lg font-extrabold tracking-tight">
          <span className="hidden text-text sm:inline">
            Prompt Lab <span className="text-text-muted">·</span>{' '}
          </span>
          <span className="text-accent">GCO</span>
        </Link>

        {/* Busca centralizada na tela, independente da largura da logo/ações */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
          <div className="pointer-events-auto w-full max-w-xs sm:max-w-sm">
            <SearchBar />
          </div>
        </div>

        <div className="z-10 ml-auto flex shrink-0 items-center gap-3">
          <Button type="button" onClick={onNewPrompt} aria-label="Novo prompt">
            <Plus size={16} aria-hidden />
            <span className="hidden sm:inline">Novo prompt</span>
          </Button>

          {user && (
            <Link to={`/perfil/${user.id}`} title="Meu perfil">
              <Avatar name={displayName} avatarUrl={profile?.avatar_url} />
            </Link>
          )}

          <Button type="button" variant="ghost" onClick={handleLogout} title="Sair">
            <LogOut size={16} aria-hidden />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
