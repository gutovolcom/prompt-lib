-- ============================================================
-- Prompt Lab — migration 0001_init
-- Schema completo conforme seção 4 da SPEC_prompt_lab.md
-- ============================================================

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

-- ============================================================
-- Row Level Security (seção 4.1 da spec)
-- ============================================================

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

-- ============================================================
-- Validação server-side de domínio de e-mail (seção 5 da spec)
-- ============================================================
-- DESATIVADO até confirmar o(s) domínio(s) com o time.
-- Deve espelhar ALLOWED_DOMAINS em src/lib/config.ts.
-- Para ativar: descomente o bloco abaixo e rode no SQL Editor.
--
-- create or replace function public.enforce_email_domain()
-- returns trigger language plpgsql security definer as $$
-- declare
--   allowed_domains text[] := array['grancursosonline.com.br'];
-- begin
--   if not (split_part(new.email, '@', 2) = any(allowed_domains)) then
--     raise exception 'Cadastro permitido apenas para e-mails corporativos GCO.';
--   end if;
--   return new;
-- end;
-- $$;
--
-- create trigger enforce_email_domain_on_signup
--   before insert on auth.users
--   for each row execute function public.enforce_email_domain();

-- ============================================================
-- Storage (seção 4.2 da spec) — passos MANUAIS no dashboard
-- ============================================================
-- Buckets não são criados por esta migration. Criar no dashboard:
--
-- 1) Bucket 'prompt-images' (Public bucket = ON)
--    - Path convention: {author_id}/{prompt_id}/{uuid}.{ext}
--    - Policies (Storage > Policies > prompt-images):
--      - select: público (as imagens não são sensíveis; simplifica o render no grid)
--        Ex.: create policy "public_read" on storage.objects for select
--             using (bucket_id = 'prompt-images');
--      - insert: authenticated e primeiro segmento do path = auth.uid()
--        Ex.: create policy "insert_own_folder" on storage.objects for insert to authenticated
--             with check (bucket_id = 'prompt-images' and (storage.foldername(name))[1] = auth.uid()::text);
--      - delete: authenticated e primeiro segmento do path = auth.uid()
--        Ex.: create policy "delete_own_folder" on storage.objects for delete to authenticated
--             using (bucket_id = 'prompt-images' and (storage.foldername(name))[1] = auth.uid()::text);
--
-- 2) Bucket 'avatars' (Public bucket = ON) — usado na Fase 4 (avatar do perfil)
--    - Mesmo padrão: select público; insert/delete authenticated
--      com primeiro segmento do path = auth.uid().
