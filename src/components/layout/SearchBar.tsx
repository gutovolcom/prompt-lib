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
    <div className="relative flex-1">
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar prompts..."
        aria-label="Buscar prompts"
        className="w-full rounded-input border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
      />
    </div>
  )
}
