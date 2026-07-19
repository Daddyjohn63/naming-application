import type { Metadata } from "next"

import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"
import { PricingView } from "@/modules/pricing/ui/views/pricing-view"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata: Metadata = {
  title: `Pricing — ${APP_NAME}`,
  description: `${APP_NAME} is free to start. Unlock the full naming ceremony — cat-world name, ineffable near-name, and certificate — for a one-time ${UNLOCK_PRICE_USD} per cat. No subscription.`,
}

export default function PricingPage() {
  return <PricingView />
}
