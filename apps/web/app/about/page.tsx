import type { Metadata } from "next"

import { PublicPageShell } from "@/modules/marketing/ui/components/public-page-shell"

export const metadata: Metadata = {
  title: "About — Naming Buddy",
  description:
    "Learn how Naming Buddy guides cat owners through a deliberate three-name ceremony.",
}

export default function AboutPage() {
  return (
    <PublicPageShell
      title="About Naming Buddy"
      description="We help cat owners honour their companions with three deliberate names — practical, playful, and ineffable — through a guided ceremony from profile to certificate."
    />
  )
}
