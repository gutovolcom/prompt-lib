// Skeletons de loading do grid: mesmas colunas do masonry, alturas variadas
// para simular os cards, com shimmer e linha fake de metadados.
const HEIGHTS = [220, 300, 260, 340, 240, 280, 320, 200, 290, 250, 310, 230]

const shimmerStyle = {
  backgroundImage: 'linear-gradient(90deg, #f4f5f7 25%, #eceef1 50%, #f4f5f7 75%)',
  backgroundSize: '200% 100%',
}

export function PromptGridSkeleton() {
  return (
    <div className="columns-1 gap-8 sm:columns-2 lg:columns-3 xl:columns-4" aria-hidden>
      {HEIGHTS.map((height, index) => (
        <div key={index} className="mb-8 break-inside-avoid">
          <div
            className="animate-shimmer rounded-card"
            style={{ height, ...shimmerStyle }}
          />
          <div className="mt-2 flex items-center gap-2 px-0.5">
            <div className="h-6 w-6 animate-shimmer rounded-full" style={shimmerStyle} />
            <div className="h-3 w-24 animate-shimmer rounded-full" style={shimmerStyle} />
          </div>
        </div>
      ))}
    </div>
  )
}
