// Domínios de e-mail autorizados a criar conta no Prompt Lab.
// Deve espelhar SEMPRE a lista do trigger enforce_email_domain no banco
// (supabase/migrations/0001_init.sql) — client e server juntos.
export const ALLOWED_DOMAINS = ['gran.com']
