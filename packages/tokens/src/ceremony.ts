/**
 * Warm guided-tunnel palette for `/cats/*` ceremony routes.
 * Design ref: ai-docs/design-docs/images/option-2-three-names-main-unlock-sidebar-mockup.png
 *
 * After editing, run: `pnpm run generate-css --filter=@workspace/tokens`
 */

export type CeremonyVariableName =
  | "background"
  | "foreground"
  | "card"
  | "card-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "destructive"
  | "border"
  | "input"
  | "ring"
  | "radius"
  | "ceremony-complete"
  | "ceremony-sidebar"
  | "ceremony-highlight"
  | "ceremony-highlight-border"

/** Light ceremony theme — cream ground, coral accent, sage complete states. */
export const ceremonyLightVars: Record<CeremonyVariableName, string> = {
  background: "oklch(0.984 0.006 90.5)",
  foreground: "oklch(0.28 0.02 55)",
  card: "oklch(0.998 0.003 90)",
  "card-foreground": "oklch(0.28 0.02 55)",
  popover: "oklch(0.998 0.003 90)",
  "popover-foreground": "oklch(0.28 0.02 55)",
  primary: "oklch(0.704 0.128 38.5)",
  "primary-foreground": "oklch(0.99 0 0)",
  secondary: "oklch(0.96 0.014 85)",
  "secondary-foreground": "oklch(0.35 0.03 55)",
  muted: "oklch(0.955 0.01 88)",
  "muted-foreground": "oklch(0.52 0.025 55)",
  accent: "oklch(0.94 0.035 75)",
  "accent-foreground": "oklch(0.32 0.04 55)",
  destructive: "oklch(0.577 0.245 27.325)",
  border: "oklch(0.902 0.012 85)",
  input: "oklch(0.902 0.012 85)",
  ring: "oklch(0.704 0.128 38.5)",
  radius: "0.75rem",
  "ceremony-complete": "oklch(0.58 0.14 155)",
  "ceremony-sidebar": "oklch(0.968 0.008 88)",
  "ceremony-highlight": "oklch(0.97 0.04 65)",
  "ceremony-highlight-border": "oklch(0.82 0.09 45)",
}

/** Dark ceremony — warm charcoal ground, coral stays readable. */
export const ceremonyDarkVars: Partial<
  Record<CeremonyVariableName, string>
> = {
  background: "#000000",
  foreground: "oklch(0.96 0.008 90)",
  card: "oklch(0.26 0.018 55)",
  "card-foreground": "oklch(0.96 0.008 90)",
  popover: "oklch(0.26 0.018 55)",
  "popover-foreground": "oklch(0.96 0.008 90)",
  primary: "oklch(0.74 0.12 42)",
  "primary-foreground": "oklch(0.2 0.02 55)",
  secondary: "oklch(0.32 0.02 55)",
  "secondary-foreground": "oklch(0.94 0.008 90)",
  muted: "oklch(0.30 0.018 55)",
  "muted-foreground": "oklch(0.72 0.02 85)",
  accent: "oklch(0.34 0.03 55)",
  "accent-foreground": "oklch(0.96 0.008 90)",
  border: "oklch(0.38 0.02 55)",
  input: "oklch(0.38 0.02 55)",
  ring: "oklch(0.74 0.12 42)",
  "ceremony-complete": "oklch(0.68 0.14 155)",
  "ceremony-sidebar": "oklch(0.28 0.018 55)",
  "ceremony-highlight": "oklch(0.32 0.04 55)",
  "ceremony-highlight-border": "oklch(0.55 0.08 45)",
}
