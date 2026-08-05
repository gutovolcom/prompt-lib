// Skeletons de loading do grid: silhuetas de pasta (aba + corpo manila)
// com shimmer em tons de papel, nas mesmas colunas do grid real.
const shimmerStyle = {
  backgroundImage:
    'linear-gradient(90deg, rgb(var(--surface-2)) 25%, rgb(var(--surface-3)) 50%, rgb(var(--surface-2)) 75%)',
  backgroundSize: '200% 100%',
}

export function PromptGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-x-8 gap-y-11 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-hidden
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="relative">
          <div
            className={`absolute -top-4 h-5 w-[38%] animate-shimmer rounded-tab ${
              ['left-1', 'left-[31%]', 'right-1'][index % 3]
            }`}
            style={shimmerStyle}
          />
          <div className="animate-shimmer rounded-card" style={{ height: 300, ...shimmerStyle }} />
        </div>
      ))}
    </div>
  )
}
