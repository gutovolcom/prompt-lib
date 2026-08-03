import { supabase } from './supabase'

// Convenções do bucket 'prompt-images' (seção 4.2 da spec):
// original em {author_id}/{prompt_id}/{uuid}.{ext} e thumb com sufixo _thumb (webp).

export function publicImageUrl(storagePath: string): string {
  return supabase.storage.from('prompt-images').getPublicUrl(storagePath).data.publicUrl
}

export function thumbPath(originalPath: string): string {
  return originalPath.replace(/\.[^.]+$/, '_thumb.webp')
}
