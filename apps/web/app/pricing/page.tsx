import type { Metadata } from "next"

import { PricingView } from "@/modules/pricing/ui/views/pricing-view"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata: Metadata = {
  title: `Pricing — ${APP_NAME}`,
  description: `${APP_NAME} is free to start. During beta, unlock the full naming ceremony — cat-world name, ineffable near-name, and certificate — at no charge. No subscription.`,
}

export default function PricingPage() {
  return <PricingView />
}
