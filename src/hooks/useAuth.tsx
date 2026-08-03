import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { ALLOWED_DOMAINS } from '../lib/config'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function isAllowedEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain !== undefined && ALLOWED_DOMAINS.includes(domain)
}

// Mapeia erros comuns do Supabase Auth para mensagens amigáveis em pt-BR.
export function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'User already registered': 'Este e-mail já possui uma conta. Use a aba Entrar.',
    'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
    'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
    'Signup requires a valid password': 'Informe uma senha válida.',
    'Unable to validate email address: invalid format': 'Formato de e-mail inválido.',
  }
  return map[message] ?? `Erro inesperado: ${message}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isAllowedEmail(email)) {
      throw new Error(
        `Cadastro permitido apenas para e-mails ${ALLOWED_DOMAINS.map((d) => `@${d}`).join(', ')}.`,
      )
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return ctx
}
