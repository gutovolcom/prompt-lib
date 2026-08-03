// Domínios de e-mail autorizados a criar conta no Prompt Lab.
// Deve espelhar SEMPRE a lista do trigger enforce_email_domain no banco
// (supabase/migrations/0001_init.sql) — client e server juntos.
export const ALLOWED_DOMAINS = ['gran.com']

// Opções fixas do select de modelo no upload (seção 6.4 da spec).
// "Outro" na UI libera input livre.
export const MODEL_OPTIONS = [
  'Nano Banana 2',
  'GPT Image',
  'Midjourney',
  'Artify',
  'Flux',
  'Ideogram',
] as const
