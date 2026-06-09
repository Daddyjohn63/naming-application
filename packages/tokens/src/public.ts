/**
 * Warm marketing palette for public routes (landing, pricing, about, auth).
 *
 * After editing, run: `pnpm run generate-css --filter=@workspace/tokens`
 */

/* Midnight navy   oklch(0.154 0.031 244.559)*/
/* Deep navy      oklch(0.191 0.035 249.636)*/
/* Parchment      oklch(0.980 0.016 73.684)*/
/* Warm cream     oklch(0.947 0.017 70.531)*/
/* Antique gold   oklch(0.804 0.081 74.925)*/
/* Sepia brown    oklch(0.559 0.066 75.606)*/

import type { SemanticVariableName } from "./semantic.js"

export type PublicVariableName = SemanticVariableName

/** Light public theme — cream ground, gold accent, navy text. */
export const publicLightVars: Record<PublicVariableName, string> = {
  background: "oklch(0.980 0.016 73.684)",
  foreground: "oklch(0.154 0.031 244.559)",
  card: "oklch(0.947 0.017 70.531)",
  "card-foreground": "oklch(0.154 0.031 244.559)",
  popover: "oklch(0.947 0.017 70.531)",
  "popover-foreground": "oklch(0.154 0.031 244.559)",
  primary: "oklch(0.804 0.081 74.925)",
  "primary-foreground": "oklch(0.154 0.031 244.559)",
  secondary: "oklch(0.927 0.020 69.986)",
  "secondary-foreground": "oklch(0.191 0.035 249.636)",
  muted: "oklch(0.927 0.020 69.986)",
  "muted-foreground": "oklch(0.559 0.066 75.606)",
  accent: "oklch(0.789 0.054 79.299)",
  "accent-foreground": "oklch(0.154 0.031 244.559)",
  destructive: "oklch(0.601 0.110 45.939)",
  border: "oklch(0.789 0.054 79.299)",
  input: "oklch(0.789 0.054 79.299)",
  ring: "oklch(0.804 0.081 74.925)",
  "chart-1": "oklch(0.804 0.081 74.925)",
  "chart-2": "oklch(0.559 0.066 75.606)",
  "chart-3": "oklch(0.354 0.037 59.514)",
  "chart-4": "oklch(0.191 0.035 249.636)",
  "chart-5": "oklch(0.601 0.110 45.939)",
  radius: "0.625rem",
  sidebar: "oklch(0.947 0.017 70.531)",
  "sidebar-foreground": "oklch(0.154 0.031 244.559)",
  "sidebar-primary": "oklch(0.804 0.081 74.925)",
  "sidebar-primary-foreground": "oklch(0.154 0.031 244.559)",
  "sidebar-accent": "oklch(0.927 0.020 69.986)",
  "sidebar-accent-foreground": "oklch(0.191 0.035 249.636)",
  "sidebar-border": "oklch(0.789 0.054 79.299)",
  "sidebar-ring": "oklch(0.804 0.081 74.925)",
}

/** Dark public theme — navy ground, gold accent. */
export const publicDarkVars: Partial<Record<PublicVariableName, string>> = {
  background: "oklch(0.154 0.031 244.559)",
  foreground: "oklch(0.980 0.016 73.684)",
  card: "oklch(0.191 0.035 249.636)",
  "card-foreground": "oklch(0.980 0.016 73.684)",
  popover: "oklch(0.191 0.035 249.636)",
  "popover-foreground": "oklch(0.980 0.016 73.684)",
  primary: "oklch(0.804 0.081 74.925)",
  "primary-foreground": "oklch(0.154 0.031 244.559)",
  secondary: "oklch(0.269 0.020 248.000)",
  "secondary-foreground": "oklch(0.947 0.017 70.531)",
  muted: "oklch(0.269 0.020 248.000)",
  "muted-foreground": "oklch(0.789 0.054 79.299)",
  accent: "oklch(0.559 0.066 75.606)",
  "accent-foreground": "oklch(0.980 0.016 73.684)",
  destructive: "oklch(0.601 0.110 45.939)",
  border: "oklch(0.804 0.081 74.925 / 35%)",
  input: "oklch(0.804 0.081 74.925 / 25%)",
  ring: "oklch(0.804 0.081 74.925)",
  "chart-1": "oklch(0.804 0.081 74.925)",
  "chart-2": "oklch(0.789 0.054 79.299)",
  "chart-3": "oklch(0.559 0.066 75.606)",
  "chart-4": "oklch(0.927 0.020 69.986)",
  "chart-5": "oklch(0.601 0.110 45.939)",
  sidebar: "oklch(0.191 0.035 249.636)",
  "sidebar-foreground": "oklch(0.980 0.016 73.684)",
  "sidebar-primary": "oklch(0.804 0.081 74.925)",
  "sidebar-primary-foreground": "oklch(0.154 0.031 244.559)",
  "sidebar-accent": "oklch(0.269 0.020 248.000)",
  "sidebar-accent-foreground": "oklch(0.947 0.017 70.531)",
  "sidebar-border": "oklch(0.804 0.081 74.925 / 35%)",
  "sidebar-ring": "oklch(0.804 0.081 74.925)",
}
