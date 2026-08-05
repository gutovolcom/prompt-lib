/**
 * Formata o número de catálogo de um prompt como código de ficha ("PL-0042").
 * Tolera ausência do valor (banco ainda sem a migration 0003) exibindo "PL-····".
 */
export function catalogCode(catalogNumber: number | null | undefined): string {
  if (catalogNumber == null) return 'PL-····'
  return `PL-${String(catalogNumber).padStart(4, '0')}`
}
