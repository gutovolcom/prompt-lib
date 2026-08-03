// Domínios de e-mail autorizados a criar conta no Prompt Lab.
// TODO(Gustavo): confirmar com o time se este é o único domínio válido
// (há variações como @gcodigital.com.br?). A validação server-side
// (trigger comentado em supabase/migrations/0001_init.sql) deve ser
// ativada com a MESMA lista após a confirmação.
export const ALLOWED_DOMAINS = ['grancursosonline.com.br']
