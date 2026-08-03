import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile, PromptWithRelations } from '../lib/types'
import { DETAIL_SELECT } from './usePrompts'
import { useAuth } from './useAuth'
import { useToast } from '../components/ui/Toast'

export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['profile', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id as string)
        .single()
      if (error) throw new Error(error.message)
      return data as Profile
    },
  })
}

// Prompts do autor com favorites(count): alimenta o grid do perfil e os
// contadores (publicados, cópias recebidas, favoritos recebidos).
export function useAuthorPrompts(authorId: string | undefined) {
  return useQuery({
    queryKey: ['prompts', 'author', authorId],
    enabled: Boolean(authorId),
    queryFn: async (): Promise<PromptWithRelations[]> => {
      const { data, error } = await supabase
        .from('prompts')
        .select(DETAIL_SELECT)
        .eq('author_id', authorId as string)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return data as unknown as PromptWithRelations[]
    },
  })
}

const AVATAR_EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

interface UpdateProfileInput {
  name?: string
  avatarFile?: File
}

// Edição do próprio perfil (seção 6.6): nome e avatar (bucket 'avatars', público).
export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ name, avatarFile }: UpdateProfileInput) => {
      if (!user) throw new Error('Sessão expirada.')
      const patch: { name?: string; avatar_url?: string } = {}

      if (avatarFile) {
        const ext = AVATAR_EXT_BY_MIME[avatarFile.type]
        if (!ext) throw new Error('Avatar deve ser PNG, JPG ou WebP.')
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { contentType: avatarFile.type })
        if (uploadError) throw new Error(uploadError.message)
        patch.avatar_url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      }

      if (name !== undefined) {
        if (!name.trim()) throw new Error('O nome não pode ficar vazio.')
        patch.name = name.trim()
      }

      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      showToast('Perfil atualizado')
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({ queryKey: ['authors'] })
      // Nome/avatar aparecem embutidos nos cards
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar o perfil.')
    },
  })
}
