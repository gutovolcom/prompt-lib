-- ============================================================
-- Prompt Lab — migration 0002_favorites_count
-- Suporte à ordenação "Mais favoritados" (seção 6.2 da spec).
-- Rodar no SQL Editor do dashboard, igual à 0001.
-- ============================================================

-- Computed column do PostgREST: função com o row type de prompts vira uma
-- "coluna virtual" utilizável em select/order (order=favorites_count.desc).
create or replace function public.favorites_count(p public.prompts)
returns bigint language sql stable as $$
  select count(*) from public.favorites f where f.prompt_id = p.id;
$$;

-- A PK de favorites é (user_id, prompt_id); este índice cobre o lookup
-- por prompt_id feito pela função acima e pelos counts do detalhe.
create index if not exists favorites_prompt_idx on public.favorites (prompt_id);
