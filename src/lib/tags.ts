export function parseTags(input: string, existing: string[]): string[] {
  const parsed = input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const next = [...existing]
  for (const tag of parsed) {
    if (!next.includes(tag)) next.push(tag)
  }
  return next
}
