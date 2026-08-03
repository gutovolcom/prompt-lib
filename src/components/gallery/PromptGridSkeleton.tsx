// Skeletons de loading do grid (Fase 4): mesmas colunas do masonry,
// alturas variadas para simular os cards.
const HEIGHTS = [220, 300, 260, 340, 240, 280, 320, 200, 290, 250, 310, 230]

export function PromptGridSkeleton() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4" aria-hidden>
      {HEIGHTS.map((height, index) => (
        <div
          key={index}
          className="mb-4 animate-pulse break-inside-avoid rounded-card bg-surface-2"
          style={{ height }}
        />
      ))}
    </div>
  )
}
