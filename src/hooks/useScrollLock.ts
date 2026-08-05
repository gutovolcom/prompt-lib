import { useEffect } from 'react'

// Trava o scroll da página enquanto um modal está aberto.
//
// O lock precisa ser no <html> (documentElement), não no <body>: o index.css
// define `html { overflow-y: scroll }`, e quando o html tem overflow explícito
// o `overflow: hidden` do body NÃO se propaga ao viewport — a página continua
// rolando por trás do modal. O `scrollbar-gutter: stable` (também no index.css)
// mantém o espaço da scrollbar reservado, evitando o "pulo" de layout quando
// ela some durante o lock.
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const html = document.documentElement
    const previous = html.style.overflowY
    html.style.overflowY = 'hidden'
    return () => {
      html.style.overflowY = previous
    }
  }, [locked])
}
