import { Gallery } from './Gallery'

// /favoritos: mesma galeria, filtrada pelos favoritos do usuário logado
// (seção 6.5 da spec).
export function Favorites() {
  return <Gallery favoritesOnly />
}
