import type { Metadata } from "next"

import { ExamplesView } from "@/modules/examples/ui/views/examples-view"

export const metadata: Metadata = {
  title: "Examples — Naming Buddy",
  description:
    "Browse sample Naming Buddy certificates — photo, personality profile, and all three names on a keepsake you can enlarge and step through.",
}

export default function ExamplesPage() {
  return <ExamplesView />
}
