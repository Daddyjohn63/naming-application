export function isBlank(value: string): boolean {
  return value.trim().length === 0
}

export function truncateWithEllipsis(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value
  const slice = value.slice(0, Math.max(0, maxChars - 1))
  return `${slice.trimEnd()}…`
}
