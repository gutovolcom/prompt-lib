// Tipos TypeScript espelhando o schema de supabase/migrations/0001_init.sql
// (seção 4 da SPEC_prompt_lab.md).

export type Role = 'member' | 'admin'

export interface Profile {
  id: string
  name: string
  avatar_url: string | null
  role: Role
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  color: string
  sort_order: number
}

export interface Prompt {
  id: string
  author_id: string
  title: string
  prompt_text: string
  negative_prompt: string | null
  model: string
  params: Record<string, unknown>
  tags: string[]
  copy_count: number
  /** Número de catálogo sequencial (0003_catalog_number.sql) — exibido como "PL-0042". */
  catalog_number: number
  created_at: string
  updated_at: string
}

export interface PromptImage {
  id: string
  prompt_id: string
  storage_path: string
  width: number | null
  height: number | null
  is_cover: boolean
  sort_order: number
  created_at: string
}

export interface PromptCategory {
  prompt_id: string
  category_id: number
}

export interface Favorite {
  user_id: string
  prompt_id: string
  created_at: string
}

// Shape retornado pelos selects com joins embutidos do supabase-js
// (aliases: author, images, categories — ver src/hooks/usePrompts.ts).
export interface PromptWithRelations extends Prompt {
  author: Profile
  images: PromptImage[]
  categories: { category: Category }[]
  /** Presente apenas no detalhe: contagem de favoritos via favorites(count). */
  favorites?: { count: number }[]
}
