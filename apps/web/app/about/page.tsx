import { AboutView } from "@/modules/about/ui/views/about-view"
import { JsonLd, buildWebPageJsonLd } from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

const title = "About"
const description = `${APP_NAME} is a guided cat naming ceremony: photo and personality in, three names out (family, unique cat-world, ineffable near-name), finished with a keepsake certificate. Free to start; unlock free during beta.`

export const metadata = createPageMetadata({
  title,
  description,
  path: "/about",
})

export default function AboutPage() {
  //throw new Error("error-logging smoke test")
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          path: "/about",
          name: `${title} | ${APP_NAME}`,
          description,
        })}
      />
      <AboutView />
    </>
  )
}
