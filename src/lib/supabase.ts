import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas. Copie .env.example para .env e preencha.',
  )
}

// Client singleton — sessão persistida em localStorage (padrão do supabase-js).
// NUNCA usar a service_role key no front-end.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
