# Prompt Lab · GCO

**Fonte da verdade: [SPEC_prompt_lab.md](./SPEC_prompt_lab.md).** Toda decisão de schema, RLS, rotas, componentes, design e regras de negócio está lá — não invente requisitos.

## Resumo

- Biblioteca interna de prompts de geração de imagem para o marketing da Gran Cursos Online.
- Stack: Vite + React 18 + TypeScript strict + Tailwind + Supabase (Auth/Postgres/Storage) + react-router v6 + react-query.
- Schema em `supabase/migrations/0001_init.sql`; tipos espelhados em `src/lib/types.ts`.
- Tema claro estilo Dribbble (tokens em `src/index.css`; ver DESIGN.md); accent vermelho GCO `#DD303E`; fonte Inter.
- Auth por e-mail/senha com domínio restrito (`ALLOWED_DOMAINS` em `src/lib/config.ts`); rotas protegidas exceto `/login`.
- Ação nº 1 do produto: botão "Copiar prompt" (incrementa `copy_count` só via RPC).

## Convenções

- TypeScript strict, sem `any`. Componentes funcionais; lógica de dados em hooks (`src/hooks/`).
- Textos da UI em pt-BR. NUNCA usar a `service_role` key no front-end.
- Commits pequenos em português, prefixados por tipo (`feat:`, `chore:`, `fix:`).
- Implementação por fases (seção 9 da spec) — não avançar de fase sem pedido explícito.
