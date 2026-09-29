import { format, parseISO } from "date-fns"
import { enGB } from "date-fns/locale"

/** `publishedAt` as an en-GB date, for example 28 September 2026. */
export function formatBlogDate(isoDate: string): string {
  return format(parseISO(isoDate), "d MMMM yyyy", { locale: enGB })
}
