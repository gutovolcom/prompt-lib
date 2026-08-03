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
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8">
        <h1 className="mb-6 text-center text-xl font-semibold">
          Prompt Lab <span className="text-text-muted">·</span>{' '}
          <span className="text-accent">GCO</span>
        </h1>

        <div role="tablist" className="mb-6 grid grid-cols-2 gap-1 rounded-input bg-surface-2 p-1">
          <button
            role="tab"
            aria-selected={tab === 'signin'}
            onClick={() => switchTab('signin')}
            className={`rounded-input py-1.5 text-sm font-medium transition duration-150 ${
              tab === 'signin' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
            }`}
          >
            Entrar
          </button>
          <button
            role="tab"
            aria-selected={tab === 'signup'}
            onClick={() => switchTab('signup')}
            className={`rounded-input py-1.5 text-sm font-medium transition duration-150 ${
              tab === 'signup' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
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
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Aguarde...' : tab === 'signin' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>
      </div>
    </main>
  )
}
