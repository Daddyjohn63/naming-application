import { ExamplesView } from "@/modules/examples/ui/views/examples-view"
import { JsonLd, buildWebPageJsonLd } from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

const title = "Examples"
const description = `Browse sample ${APP_NAME} certificates — photo, personality profile, and all three names on a keepsake you can enlarge and step through.`

export const metadata = createPageMetadata({
  title,
  description,
  path: "/examples",
})

export default function ExamplesPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          path: "/examples",
          name: `${title} | ${APP_NAME}`,
          description,
        })}
      />
      <ExamplesView />
    </>
  )
}
