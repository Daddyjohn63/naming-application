import { APP_NAME } from "./app"

/** Apex hostname (no protocol, no www). Used in display copy and email. */
export const SITE_DOMAIN = "purrfectlynamed.com"

/** Live host: Vercel 308s apex → www. Canonicals must match this. */
export const SITE_WWW_HOST = `www.${SITE_DOMAIN}`

/** Absolute origin used for canonical URLs, Open Graph, and sitemap. */
export const SITE_URL = `https://${SITE_WWW_HOST}`

/** Short brand line for titles and social cards. */
export const SITE_TAGLINE = "Discover your cat's three names"

/** Default meta description for the marketing site. */
export const SITE_DESCRIPTION =
  "A guided naming ceremony for cat owners: an everyday family name, a globally unique cat-world name, and a playful guess at the ineffable one — finished with a keepsake certificate. Free to start, and free to unlock during beta."

/** Primary keywords for meta and discovery (not stuffed into visible copy). */
export const SITE_KEYWORDS = [
  APP_NAME,
  "cat naming",
  "cat name generator",
  "naming ceremony",
  "cat certificate",
  "T. S. Eliot",
  "The Naming of Cats",
  "cat-world name",
  "family name for cats",
  "pet naming",
  SITE_DOMAIN,
] as const

/** Default social / OG image alt text. */
export const SITE_OG_IMAGE_ALT = `${APP_NAME} — ${SITE_TAGLINE}`
