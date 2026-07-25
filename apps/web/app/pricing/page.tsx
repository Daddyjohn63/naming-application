import { PricingView } from "@/modules/pricing/ui/views/pricing-view"
import { PRICING_FAQ_ITEMS } from "@/modules/pricing/lib/pricing-faq"
import {
  JsonLd,
  buildFaqPageJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

const title = "Pricing"
const description = `${APP_NAME} is free to start. During beta, unlock the full naming ceremony — cat-world name, ineffable near-name, and certificate — at no charge. No subscription.`

export const metadata = createPageMetadata({
  title,
  description,
  path: "/pricing",
})

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          path: "/pricing",
          name: `${title} | ${APP_NAME}`,
          description,
        })}
      />
      <JsonLd data={buildFaqPageJsonLd(PRICING_FAQ_ITEMS)} />
      <PricingView />
    </>
  )
}
