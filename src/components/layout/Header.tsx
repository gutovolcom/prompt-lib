import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Plus, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

export function Header() {
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

        {/* Busca — habilitada na Fase 3 */}
        <div className="relative flex-1">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            disabled
            placeholder="Buscar prompts... (em breve)"
            aria-label="Buscar prompts (em breve)"
            className="w-full rounded-input border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {/* Ação implementada na Fase 2 (modal de upload) */}
          <Button type="button">
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
