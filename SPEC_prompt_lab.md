# SPEC — Prompt Lab (Biblioteca de Prompts GCO)

> Especificação completa para implementação via Claude Code.
> Escopo de usuários: todo o time de marketing da GCO.
> Autenticação: e-mail/senha (Supabase Auth).

---

## 1. Visão geral

Biblioteca interna de prompts de geração de imagem. Cada entrada ("prompt card") contém uma ou mais imagens geradas + o prompt exato usado, com autoria, modelo, categorias e tags. O objetivo é que qualquer pessoa do marketing encontre, copie e reutilize prompts que já deram certo — reduzindo retrabalho e padronizando a qualidade visual.

**Referência visual:** Magnific/Freepik — grid denso focado nas imagens, tema escuro, informação revelada no hover, fricção zero para copiar o prompt.

**Ação nº 1 do produto:** botão "Copiar prompt" — deve estar a 1 clique de qualquer lugar.

---

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Front-end | React 18 + Vite + TypeScript |
| Estilo | Tailwind CSS |
| Backend/BaaS | Supabase (Auth, Postgres, Storage) |
| Busca (MVP) | Postgres full-text search (`portuguese`) + `pg_trgm` |
| Deploy | Vercel |
| Roteamento | react-router-dom v6 |
| Estado servidor | @tanstack/react-query |
| Upload | Supabase Storage + drag-and-drop nativo |

Sem framework de UI pesado — Tailwind puro. Ícones: `lucide-react`.

---

## 3. Estrutura do projeto

```
prompt-lab/
├── CLAUDE.md                  # resumo curto apontando para esta spec
├── .env.example               # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── supabase/
│   └── migrations/
│       └── 0001_init.sql      # schema completo (seção 4)
├── src/
│   ├── lib/
│   │   ├── supabase.ts        # client singleton
│   │   └── types.ts           # tipos gerados/manuais do schema
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePrompts.ts      # listagem c/ filtros, busca, paginação
│   │   ├── useFavorites.ts
│   │   └── useUpload.ts
│   ├── components/
│   │   ├── layout/            # Header, SearchBar, CategoryPills
│   │   ├── gallery/           # PromptGrid, PromptCard, CardHoverOverlay
│   │   ├── prompt/            # PromptDetailModal, CopyButton, ImageCarousel
│   │   ├── upload/            # UploadModal (multi-step), ImageDropzone
│   │   └── ui/                # Button, Badge, Avatar, Input, Toast
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Gallery.tsx        # rota /
│   │   ├── Favorites.tsx      # rota /favoritos
│   │   └── Profile.tsx        # rota /perfil/:id
│   └── App.tsx
└── package.json
```

---

## 4. Schema SQL (migration 0001_init.sql)

```sql
-- Extensões
create extension if not exists pg_trgm;

-- =========================
-- PROFILES
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  role text default 'member',            -- 'member' | 'admin'
  created_at timestamptz default now()
);

-- Trigger: cria profile automaticamente no signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- CATEGORIES
-- =========================
create table public.categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  color text default '#DD303E',          -- hex para o pill na UI
  sort_order int default 0
);

-- Seed inicial (ajustável)
insert into public.categories (name, slug, color, sort_order) values
  ('Carreira Policial', 'carreira-policial', '#DD303E', 1),
  ('KV Campanha',       'kv-campanha',       '#0D134C', 2),
  ('Personagens',       'personagens',       '#E8890C', 3),
  ('Fundos / Plates',   'fundos-plates',     '#1D9E75', 4),
  ('Editorial / Blog',  'editorial-blog',    '#534AB7', 5),
  ('Social / Feed',     'social-feed',       '#D4537E', 6);

-- =========================
-- PROMPTS
-- =========================
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  prompt_text text not null,
  negative_prompt text,
  model text not null,                   -- 'Nano Banana 2', 'GPT Image', 'Midjourney', 'Artify', etc.
  params jsonb default '{}',             -- aspect ratio, seed, steps, etc.
  tags text[] default '{}',
  copy_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Full-text search em português (título + prompt + tags)
  fts tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(prompt_text, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(array_to_string(tags, ' '), '')), 'A')
  ) stored
);

create index prompts_fts_idx on public.prompts using gin (fts);
create index prompts_title_trgm_idx on public.prompts using gin (title gin_trgm_ops);
create index prompts_author_idx on public.prompts (author_id);
create index prompts_created_idx on public.prompts (created_at desc);

-- =========================
-- PROMPT_IMAGES
-- =========================
create table public.prompt_images (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  storage_path text not null,            -- caminho no bucket 'prompt-images'
  width int,
  height int,
  is_cover boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index prompt_images_prompt_idx on public.prompt_images (prompt_id);

-- =========================
-- PROMPT_CATEGORIES (junction)
-- =========================
create table public.prompt_categories (
  prompt_id uuid references public.prompts(id) on delete cascade,
  category_id int references public.categories(id) on delete cascade,
  primary key (prompt_id, category_id)
);

-- =========================
-- FAVORITES
-- =========================
create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, prompt_id)
);

-- =========================
-- RPC: incrementar copy_count (evita race condition no client)
-- =========================
create or replace function public.increment_copy_count(p_prompt_id uuid)
returns void language sql security definer as $$
  update public.prompts set copy_count = copy_count + 1 where id = p_prompt_id;
$$;

-- =========================
-- RPC: busca combinada (FTS + trigram fallback)
-- =========================
create or replace function public.search_prompts(q text)
returns setof public.prompts language sql stable as $$
  select * from public.prompts
  where fts @@ websearch_to_tsquery('portuguese', q)
     or title ilike '%' || q || '%'
  order by ts_rank(fts, websearch_to_tsquery('portuguese', q)) desc,
           created_at desc;
$$;
```

### 4.1 Row Level Security

```sql
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_images enable row level security;
alter table public.prompt_categories enable row level security;
alter table public.categories enable row level security;
alter table public.favorites enable row level security;

-- Leitura: qualquer usuário autenticado lê tudo
create policy "read_all" on public.profiles for select to authenticated using (true);
create policy "read_all" on public.prompts for select to authenticated using (true);
create policy "read_all" on public.prompt_images for select to authenticated using (true);
create policy "read_all" on public.prompt_categories for select to authenticated using (true);
create policy "read_all" on public.categories for select to authenticated using (true);
create policy "read_own_and_counts" on public.favorites for select to authenticated using (true);

-- Escrita: autor gerencia o que é dele
create policy "insert_own" on public.prompts for insert to authenticated
  with check (author_id = auth.uid());
create policy "update_own" on public.prompts for update to authenticated
  using (author_id = auth.uid());
create policy "delete_own" on public.prompts for delete to authenticated
  using (author_id = auth.uid());

create policy "insert_own_images" on public.prompt_images for insert to authenticated
  with check (exists (select 1 from public.prompts p where p.id = prompt_id and p.author_id = auth.uid()));
create policy "delete_own_images" on public.prompt_images for delete to authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_id and p.author_id = auth.uid()));

create policy "insert_own_cats" on public.prompt_categories for insert to authenticated
  with check (exists (select 1 from public.prompts p where p.id = prompt_id and p.author_id = auth.uid()));
create policy "delete_own_cats" on public.prompt_categories for delete to authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_id and p.author_id = auth.uid()));

-- Favoritos: cada um gerencia os seus
create policy "insert_own_fav" on public.favorites for insert to authenticated
  with check (user_id = auth.uid());
create policy "delete_own_fav" on public.favorites for delete to authenticated
  using (user_id = auth.uid());

-- Profile: usuário edita o próprio
create policy "update_own_profile" on public.profiles for update to authenticated
  using (id = auth.uid());
```

### 4.2 Storage

- Bucket: `prompt-images` (público para leitura via URL, escrita autenticada).
- Path convention: `{author_id}/{prompt_id}/{uuid}.{ext}`.
- Policies do bucket:
  - `select`: público (as imagens não são sensíveis; simplifica render no grid).
  - `insert`/`delete`: `authenticated` e o primeiro segmento do path = `auth.uid()`.
- No upload: gerar thumbnail client-side (canvas, max 800px no lado maior, webp qualidade 0.85) e subir original + thumb (`_thumb` sufixo). O grid usa a thumb; o modal de detalhe usa a original.

---

## 5. Autenticação

- Supabase Auth com e-mail/senha.
- **Signup aberto com validação de domínio no client E no server**: aceitar apenas e-mails `@grancursosonline.com.br` (confirmar domínio real com o time — deixar em constante `ALLOWED_DOMAINS`).
  - Server-side: usar um `before user created` hook OU trigger em `auth.users` que dá raise exception se o domínio não bater (implementar como trigger na migration, comentado, para ativar após confirmar domínio).
- Confirmação de e-mail: **desativada** (ferramenta interna; reduz fricção). Documentar no README como ativar.
- Recuperação de senha: fluxo padrão do Supabase (`resetPasswordForEmail`).
- Sessão persistida (localStorage padrão do supabase-js).
- Rotas protegidas: tudo exceto `/login` exige sessão; redirect para `/login` se ausente.

---

## 6. Páginas e fluxos

### 6.1 `/login`
- Card centralizado, tema escuro, logo "promptlib".
- Tabs: Entrar / Criar conta. Campos mínimos (nome só no signup).
- Mensagens de erro em pt-BR amigáveis (mapear erros do Supabase).

### 6.2 `/` — Galeria (página principal)
- **Header fixo**: logo à esquerda, barra de busca central (dominante), avatar do usuário + botão "Novo prompt" à direita.
- **Barra de filtros** abaixo do header: pills de categoria (Todos + categorias do banco, na ordem `sort_order`), pill "Favoritos", dropdown "Modelo" (valores distintos existentes no banco), dropdown "Autor" (lista de profiles), toggle de ordenação (Recentes | Mais copiados | Mais favoritados).
- **Grid masonry**: CSS `columns` (4 colunas ≥1280px, 3 ≥1024, 2 ≥640, 1 mobile). Cards preservam aspect ratio da imagem de capa.
- **Card (estado normal)**: só a imagem, cantos arredondados (12px).
- **Card (hover)**: overlay escuro gradiente de baixo pra cima com: título, badge do modelo, avatar+nome do autor, coração (favoritar, otimista) e botão "Copiar prompt" (copia `prompt_text` + toast "Prompt copiado" + chama `increment_copy_count`).
- **Clique no card**: abre modal de detalhe (rota `/p/:id` via state, deep-linkável).
- **Paginação**: infinite scroll (react-query `useInfiniteQuery`, 30 por página, keyset por `created_at`).
- **Busca**: debounce 300ms; chama RPC `search_prompts`; filtros de categoria/modelo/autor aplicados por cima do resultado.
- **Empty states**: sem resultados de busca ("Nenhum prompt encontrado — tente outros termos") e biblioteca vazia (CTA "Suba o primeiro prompt").

### 6.3 Modal de detalhe (`/p/:id`)
- Layout 2 colunas (imagem grande à esquerda com carousel se >1 imagem; painel à direita).
- Painel: título, autor (link p/ perfil), data, badges de categorias, badge do modelo, contadores (copiado Nx, ♥ Nx).
- `prompt_text` em bloco `<pre>` monoespaçado com botão "Copiar" grande.
- `negative_prompt` e `params` (se existirem) em seções colapsáveis.
- Se autor = usuário logado: botões Editar / Excluir (confirm dialog).
- Botão baixar imagem original.

### 6.4 Upload — modal "Novo prompt" (2 passos)
- **Passo 1**: dropzone multi-imagem (png/jpg/webp, máx 10 imagens, 15MB cada), preview com reorder por drag e seleção da capa (primeira por padrão).
- **Passo 2**: formulário — título*, prompt_text* (textarea grande), negative_prompt, modelo* (select com opções fixas + "Outro" com input livre: `Nano Banana 2`, `GPT Image`, `Midjourney`, `Artify`, `Flux`, `Ideogram`), categorias* (multi-select pills, mín. 1), tags (input com chips), params (pares chave/valor opcionais).
- Submit: cria prompt → sobe imagens (com progresso) → insere `prompt_images` e `prompt_categories` → invalida queries → fecha modal + toast → card novo aparece no topo.
- Tratamento de falha parcial: se upload de imagem falhar, permitir retry sem perder o formulário.

### 6.5 `/favoritos`
- Mesma galeria, filtrada por favoritos do usuário logado.

### 6.6 `/perfil/:id`
- Header do perfil: avatar, nome, contadores (prompts publicados, total de cópias recebidas, total de favoritos recebidos).
- Grid com os prompts do autor.
- Se perfil próprio: editar nome e avatar (upload para bucket `avatars`, público).

---

## 7. UI / Design system

> ⚠️ **Superseded**: o design system atual do app é o tema claro estilo Dribbble descrito em [DESIGN.md](./DESIGN.md) (decisão de 2026-08-03). A seção abaixo é registro histórico da versão inicial (tema escuro).

**Tema escuro por padrão** (estilo Magnific) — versão histórica, não reflete o app atual:

```
--bg:            #0E0E11   (fundo geral)
--surface:       #17171C   (cards, header, modais)
--surface-2:     #1F1F26   (inputs, hover)
--border:        #2A2A33
--text:          #F4F4F6
--text-muted:    #9B9BA6
--accent:        #DD303E   (vermelho GCO — CTAs, pills ativas, coração favoritado)
--accent-2:      #0D134C   (navy GCO — detalhes secundários)
```

- Fonte: Inter (via `@fontsource/inter`). Pesos 400/500/600.
- Raio: 12px cards/modais, 8px inputs/botões, 999px pills.
- Toasts: canto inferior direito, 2.5s.
- Transições sutis (150–200ms) em hover de card e pills.
- Acessível: foco visível, `alt` nas imagens = título do prompt, contraste AA no texto sobre overlay.

---

## 8. Regras de negócio

1. Todo prompt precisa de ≥1 imagem, ≥1 categoria, título, prompt_text e modelo.
2. Só o autor edita/exclui o próprio prompt (enforced por RLS, refletido na UI).
3. Excluir prompt remove imagens do Storage (limpar no client após delete OU edge function; MVP: client-side best-effort + documentar órfãos).
4. `copy_count` só incrementa via RPC (nunca update direto do client).
5. Favoritar é idempotente e otimista na UI (rollback em erro).
6. Categorias são gerenciadas por admins direto no banco no MVP (sem UI de admin).

---

## 9. Fases de implementação (para Claude Code)

**Fase 1 — Fundação**
- Scaffold Vite + TS + Tailwind + router + react-query.
- Migration 0001 aplicada, buckets criados, client Supabase, tipos.
- Auth completo (login, signup c/ validação de domínio, logout, rota protegida).
- ✅ Critério: usuário cria conta, loga e vê galeria vazia com empty state.

**Fase 2 — Núcleo**
- Upload modal completo (2 passos, thumbs client-side).
- Grid masonry + card + hover overlay + copiar prompt (com RPC de contagem).
- Modal de detalhe deep-linkável.
- ✅ Critério: fluxo completo subir → ver no grid → abrir → copiar.

**Fase 3 — Descoberta**
- Busca (RPC + debounce), filtros de categoria/modelo/autor, ordenação, infinite scroll.
- Favoritos (toggle + página /favoritos).
- ✅ Critério: buscar "policial", filtrar por modelo e favoritar funcionam combinados.

**Fase 4 — Perfis e polish**
- Página de perfil + edição de perfil + avatar.
- Editar/excluir prompt próprio.
- Estados de loading (skeletons no grid), tratamento de erros, responsivo mobile.
- ✅ Critério: revisão visual completa vs. referência Magnific.

**Backlog (não implementar agora):** coleções, remix/linhagem de prompts, busca semântica (pgvector), ranking, integração Artify, UI de admin de categorias.

---

## 10. Variáveis de ambiente

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nunca commitar `.env`. O `service_role` key não é usado no front em hipótese alguma.
