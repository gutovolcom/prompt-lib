-- Número de catálogo sequencial dos prompts (identidade visual "O Arquivo").
-- Exibido na UI como "PL-0042" (zero-pad 4) — ver src/lib/catalog.ts.
-- Coluna identity: preenche automaticamente os prompts existentes na ordem
-- física e os novos a cada insert; nunca é escrita pelo cliente.
alter table public.prompts
  add column catalog_number bigint generated always as identity;
