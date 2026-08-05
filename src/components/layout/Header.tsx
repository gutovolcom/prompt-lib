import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { Avatar } from '../ui/Avatar'
import { SearchBar } from './SearchBar'
import logoUrl from '../../assets/logo-prompt-lib.svg'

interface HeaderProps {
  onNewPrompt: () => void
}

// Header como gaveteiro do arquivo: barra grafite com a logo em creme/manila,
// busca translúcida e um botão manila para arquivar um novo prompt.
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
    <header className="sticky top-0 z-10 border-b-[3px] border-cabinet-dark bg-gradient-to-b from-cabinet to-cabinet-dark shadow-[0_3px_14px_rgba(30,30,30,0.3)]">
      <div className="mx-auto flex h-[66px] max-w-[1360px] items-center gap-5 px-6">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Prompt Lab — página inicial">
          <img src={logoUrl} alt="Prompt Lab — arquivo de fórmulas" className="h-8 w-auto sm:h-9" />
        </Link>

        <div className="mx-auto hidden w-full max-w-md sm:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3.5">
          <button
            type="button"
            onClick={onNewPrompt}
            aria-label="Arquivar prompt"
            className="inline-flex items-center gap-2 rounded-input border-b-[3px] border-manila-deep bg-manila px-4 py-2 font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-text transition-transform duration-150 hover:-translate-y-px active:translate-y-px active:border-b"
          >
            <Plus size={15} aria-hidden />
            <span className="hidden sm:inline">Arquivar prompt</span>
          </button>

          {user && (
            <Link to={`/perfil/${user.id}`} title="Meu perfil">
              <Avatar name={displayName} avatarUrl={profile?.avatar_url} />
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface/50 text-surface/80 transition duration-150 hover:border-surface hover:text-surface"
          >
            <LogOut size={15} aria-hidden />
            <span className="sr-only">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
