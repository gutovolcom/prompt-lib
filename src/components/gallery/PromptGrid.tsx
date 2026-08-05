import type { PromptWithRelations } from '../../lib/types'
import { PromptCard } from './PromptCard'

interface PromptGridProps {
  prompts: PromptWithRelations[]
  /**
   * Id do prompt em destaque da semana: vira pasta confidencial (variante
   * "secret") fixada no início do grid, ocupando 2 colunas.
   */
  featuredId?: string | null
}

// Grid regular de pastas (as pastas têm proporção fixa, diferente do antigo
// masonry). O padding-top acomoda as abas, que se projetam acima dos cards.
export function PromptGrid({ prompts, featuredId }: PromptGridProps) {
  const featured = featuredId ? prompts.find((prompt) => prompt.id === featuredId) : undefined
  const rest = featured ? prompts.filter((prompt) => prompt.id !== featured.id) : prompts

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-11 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {featured && <PromptCard prompt={featured} variant="secret" />}
      {rest.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  )
}
