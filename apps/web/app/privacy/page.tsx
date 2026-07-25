import { PrivacyView } from "@/modules/legal/ui/views/privacy-view"
import { JsonLd, buildWebPageJsonLd } from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

const title = "Privacy"
const description = `How ${APP_NAME} collects, uses, and protects your information, including cookies and third-party services.`

export const metadata = createPageMetadata({
  title,
  description,
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          path: "/privacy",
          name: `${title} | ${APP_NAME}`,
          description,
        })}
      />
      <PrivacyView />
    </>
  )
}
