import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ALLOWED_DOMAINS } from '../lib/config'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

type Tab = 'signin' | 'signup'

export function Login() {
  const { session, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (tab === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(name, email, password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  function switchTab(next: Tab) {
    setTab(next)
    setError(null)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8 shadow-md">
        <div className="mx-auto mb-6 w-fit rounded-input border-2 border-cabinet-dark bg-surface px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-text shadow-[inset_0_0_0_2px_rgba(198,162,84,0.5)]">
          Prompt Lab
          <small className="block text-center text-[8.5px] font-normal normal-case tracking-[0.3em] text-text-2">
            arquivo de fórmulas · GCO
          </small>
        </div>

        <div role="tablist" className="mb-6 flex items-end gap-1 border-b-2 border-text">
          <button
            role="tab"
            aria-selected={tab === 'signin'}
            onClick={() => switchTab('signin')}
            className={`flex-1 rounded-tab border border-b-0 border-text/35 py-2 font-mono text-xs font-bold uppercase tracking-[0.06em] transition-all duration-150 ${
              tab === 'signin' ? 'border-text bg-surface pb-[9px] pt-[11px] text-text' : 'bg-surface-2/60 text-text-2 hover:text-text'
            }`}
          >
            Entrar
          </button>
          <button
            role="tab"
            aria-selected={tab === 'signup'}
            onClick={() => switchTab('signup')}
            className={`flex-1 rounded-tab border border-b-0 border-text/35 py-2 font-mono text-xs font-bold uppercase tracking-[0.06em] transition-all duration-150 ${
              tab === 'signup' ? 'border-text bg-surface pb-[9px] pt-[11px] text-text' : 'bg-surface-2/60 text-text-2 hover:text-text'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'signup' && (
            <Input
              label="Nome"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          )}
          <Input
            label="E-mail"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`voce@${ALLOWED_DOMAINS[0]}`}
          />
          <Input
            label="Senha"
            type="password"
            required
            minLength={6}
            autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Aguarde...' : tab === 'signin' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>
      </div>
    </main>
  )
}
