/**
 * Normalizes user-facing input into a URL-friendly slug segment.
 * Convex still stores the final value; this is for client previews and suggested defaults.
 */
export function suggestSlugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}
