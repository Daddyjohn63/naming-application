import { CatNameGeneratorView } from "@/modules/cat-name-generator/ui/views/cat-name-generator-view"
import { CAT_NAME_GENERATOR_FAQ_ITEMS } from "@/modules/cat-name-generator/lib/cat-name-generator-faq"
import {
  JsonLd,
  buildFaqPageJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

const title = "Cat Name Generator"
const description = `Free cat name generator that starts with your cat's photo and personality. ${APP_NAME} suggests tailored names, discovers all three names, and finishes with a keepsake certificate. Free to start — unlock free during beta.`

export const metadata = createPageMetadata({
  title,
  description,
  path: "/cat-name-generator",
  keywords: [
    "cat name generator",
    "cat names",
    "kitten names",
    "what to name my cat",
    "unique cat names",
    "cute cat names",
    "cat naming ceremony",
    APP_NAME,
  ],
})

export default function CatNameGeneratorPage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          path: "/cat-name-generator",
          name: `${title} | ${APP_NAME}`,
          description,
        })}
      />
      <JsonLd data={buildFaqPageJsonLd(CAT_NAME_GENERATOR_FAQ_ITEMS)} />
      <CatNameGeneratorView />
    </>
  )
}
