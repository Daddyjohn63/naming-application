import { AboutView } from "@/modules/about/ui/views/about-view"
import { JsonLd, buildWebPageJsonLd } from "@/lib/seo/json-ld"
import { createPageMetadata } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

const title = "About"
const description = `Meet ${APP_NAME}: a cat naming ceremony inspired by T. S. Eliot and sparked by Andrew Lloyd Webber's Cats — built by people who love cats.`

export const metadata = createPageMetadata({
  title,
  description,
  path: "/about",
})

export default function AboutPage() {
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
