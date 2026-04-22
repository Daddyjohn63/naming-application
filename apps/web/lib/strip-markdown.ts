/**
 * Best-effort plain text for chat bubbles. Handles common model markdown
 * without pulling in a full markdown parser.
 */
export function stripDisplayMarkdown(input: string): string {
  let s = input

  s = s.replace(/```[\s\S]*?```/g, (block) => {
    const inner = block.slice(3, -3).replace(/^[^\n]*\n/, "")
    return inner.trimEnd()
  })

  s = s.replace(/`([^`]+)`/g, "$1")

  s = s.replace(/^#{1,6}\s+/gm, "")

  s = s.replace(/^\s{0,3}[-*+]\s+/gm, "")

  s = s.replace(/^\s{0,3}\d+\.\s+/gm, "")

  s = s.replace(/^>\s?/gm, "")

  s = s.replace(/\*\*([^*]+)\*\*/g, "$1")
  s = s.replace(/__([^_]+)__/g, "$1")
  s = s.replace(/\*([^*]+)\*/g, "$1")
  s = s.replace(/_([^_]+)_/g, "$1")

  s = s.replace(/\[([^\]]+)]\([^)]+\)/g, "$1")

  s = s.replace(/^---+$/gm, "")

  return s.replace(/\n{3,}/g, "\n\n").trimEnd()
}
