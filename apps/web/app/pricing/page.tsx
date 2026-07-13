import type { Metadata } from "next"

import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"
import { PricingView } from "@/modules/pricing/ui/views/pricing-view"

export const metadata: Metadata = {
  title: "Pricing — Naming Buddy",
  description: `Naming Buddy is free to start. Unlock the full naming ceremony — cat-world name, ineffable near-name, and certificate — for a one-time ${UNLOCK_PRICE_USD} per cat. No subscription.`,
}

export default function PricingPage() {
  return <PricingView />
}
