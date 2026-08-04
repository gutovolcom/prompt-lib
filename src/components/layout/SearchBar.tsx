import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useFilters } from '../../hooks/useFilters'

// Busca central do header (seção 6.2): debounce de 300ms antes de aplicar.
export function SearchBar() {
  const { filters, patchFilters } = useFilters()
  const [value, setValue] = useState(filters.search)

  useEffect(() => {
    const timeout = setTimeout(() => {
      patchFilters({ search: value })
    }, 300)
    return () => clearTimeout(timeout)
  }, [value, patchFilters])

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm">
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar prompts..."
        aria-label="Buscar prompts"
        className="w-full rounded-pill border border-transparent bg-surface-2 py-2.5 pl-4 pr-12 text-sm text-text placeholder:text-text-muted transition duration-150 focus:border-accent focus:bg-surface focus:outline-none"
      />
      <span
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-accent text-white"
        aria-hidden
      >
        <Search size={16} />
      </span>
    </div>
  )
}
