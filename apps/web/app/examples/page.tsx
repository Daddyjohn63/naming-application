import type { Metadata } from "next"

import { PublicPageShell } from "@/modules/marketing/ui/components/public-page-shell"

export const metadata: Metadata = {
  title: "Examples — Naming Buddy",
  description:
    "See how the Naming Buddy ceremony walks from family names to cat-world names and the quiet third name.",
}

export default function ExamplesPage() {
  return (
    <PublicPageShell
      title="Examples"
      description="Sample ceremonies and name styles will live here soon. Start your own from the home page when you are ready."
    />
  )
}
