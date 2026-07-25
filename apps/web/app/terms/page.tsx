import { TermsView } from "@/modules/legal/ui/views/terms-view"
import { JsonLd, buildWebPageJsonLd } from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

const title = "Terms & Conditions"
const description = `Terms governing your use of ${APP_NAME}, including accounts, content, payments, and acceptable use.`

export const metadata = createPageMetadata({
  title,
  description,
  path: "/terms",
})

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          path: "/terms",
          name: `${title} | ${APP_NAME}`,
          description,
        })}
      />
      <TermsView />
    </>
  )
}
