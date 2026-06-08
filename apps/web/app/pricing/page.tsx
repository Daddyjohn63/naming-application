import type { Metadata } from "next"

import { PublicPageShell } from "@/modules/marketing/ui/components/public-page-shell"

export const metadata: Metadata = {
  title: "Pricing — Naming Buddy",
  description:
    "Explore Naming Buddy pricing for unlocking ceremony stages per cat.",
}

export default function PricingPage() {
  return (
    <PublicPageShell
      title="Pricing"
      description="Early steps are free to explore. Unlocking paid stages stays per cat, whenever you are ready — detailed pricing will appear here soon."
    />
  )
}
