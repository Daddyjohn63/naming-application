import { UniqueCatNamesView } from "@/modules/unique-cat-names/ui/views/unique-cat-names-view"
import { UNIQUE_CAT_NAMES_FAQ_ITEMS } from "@/modules/unique-cat-names/lib/unique-cat-names-faq"
import {
  JsonLd,
  buildFaqPageJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

const title = "Unique Cat Names"
const description = `Find unique cat names from your cat's personality — unusual family names, a globally claimed cat-world name, and a poetic ineffable near-name. ${APP_NAME} finishes with a keepsake certificate. Free to start.`

export const metadata = createPageMetadata({
  title,
  description,
  path: "/unique-cat-names",
  keywords: [
    "unique cat names",
    "unusual cat names",
    "fancy cat names",
    "elegant cat names",
    "literary cat names",
    "one of a kind cat names",
    "cat-world name",
    APP_NAME,
  ],
})

export default function UniqueCatNamesPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          path: "/unique-cat-names",
          name: `${title} | ${APP_NAME}`,
          description,
        })}
      />
      <JsonLd data={buildFaqPageJsonLd(UNIQUE_CAT_NAMES_FAQ_ITEMS)} />
      <UniqueCatNamesView />
    </>
  )
}
