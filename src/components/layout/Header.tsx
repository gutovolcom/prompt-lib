import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { SearchBar } from './SearchBar'

interface HeaderProps {
  onNewPrompt: () => void
}

export function Header({ onNewPrompt }: HeaderProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const displayName =
    (user?.user_metadata['name'] as string | undefined) ?? user?.email?.split('@')[0] ?? 'Usuário'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="shrink-0 text-lg font-semibold">
          Prompt Lab <span className="text-text-muted">·</span>{' '}
          <span className="text-accent">GCO</span>
        </Link>

        <SearchBar />

        <div className="flex shrink-0 items-center gap-3">
          <Button type="button" onClick={onNewPrompt}>
            <Plus size={16} aria-hidden />
            Novo prompt
          </Button>

          {user && (
            <Link to={`/perfil/${user.id}`} title="Meu perfil">
              <Avatar name={displayName} />
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
