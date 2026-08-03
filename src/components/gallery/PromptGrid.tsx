import type { PromptWithRelations } from '../../lib/types'
import { PromptCard } from './PromptCard'

interface PromptGridProps {
  prompts: PromptWithRelations[]
}

// Grid masonry via CSS columns (seção 6.2):
// 4 colunas ≥1280px (xl), 3 ≥1024 (lg), 2 ≥640 (sm), 1 no mobile.
export function PromptGrid({ prompts }: PromptGridProps) {
  return (
    <div className="columns-1 gap-8 sm:columns-2 lg:columns-3 xl:columns-4">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  )
}
