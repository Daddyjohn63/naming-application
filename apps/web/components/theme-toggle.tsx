"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"

import { dataComponent } from "@/lib/data-component"

const THEME_CYCLE = ["light", "dark", "system"] as const
type ThemePreference = (typeof THEME_CYCLE)[number]

function nextPreference(theme: string | undefined): string {
  const current: ThemePreference = THEME_CYCLE.includes(
    theme as ThemePreference
  )
    ? (theme as ThemePreference)
    : "light"
  const i = THEME_CYCLE.indexOf(current)
  const next = THEME_CYCLE[(i + 1) % THEME_CYCLE.length] as ThemePreference
  return next
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const preference = theme ?? "light"
  const Icon =
    preference === "dark" ? Moon : preference === "system" ? Monitor : Sun

  const label =
    preference === "light"
      ? "Light theme (next: dark)"
      : preference === "dark"
        ? "Dark theme (next: system)"
        : "System theme (next: light)"

  if (!mounted) {
    return (
      <div
        {...dataComponent("ThemeToggle")}
        className="size-8 shrink-0"
        aria-hidden
      />
    )
  }

  return (
    <Button
      {...dataComponent("ThemeToggle")}
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className="shrink-0"
      onClick={() => setTheme((prev) => nextPreference(prev))}
    >
      <Icon className="size-4" />
      <span className="sr-only">{label}</span>
    </Button>
  )
}

export { nextPreference }
