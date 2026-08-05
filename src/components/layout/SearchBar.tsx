import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useFilters } from '../../hooks/useFilters'

// Busca do header (seção 6.2): debounce de 300ms antes de aplicar.
// Vidro translúcido sobre o gaveteiro grafite — não é uma pill de app comum.
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
    <div className="relative flex items-center gap-2.5 rounded-input border border-surface/30 bg-surface/10 px-3.5 py-2.5 transition duration-200 focus-within:bg-surface/20 hover:bg-surface/20">
      <Search size={15} className="shrink-0 text-surface/70" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="consultar o arquivo…"
        aria-label="Buscar prompts"
        className="w-full bg-transparent font-mono text-[13px] text-surface placeholder:text-surface/60 focus:outline-none"
      />
    </div>
  )
}
