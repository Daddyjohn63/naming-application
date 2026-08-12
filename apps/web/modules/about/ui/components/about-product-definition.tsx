import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { SITE_WWW_HOST } from "@workspace/shared/constants/site"

/**
 * Encyclopedic product definition for humans and AI crawlers.
 * Lead with what it is, then what you get — before the origin story.
 */
export function AboutProductDefinition() {
  return (
    <section
      {...dataComponent("AboutProductDefinition")}
      className="w-full border-b border-border/40 bg-muted/30"
      aria-labelledby="about-product-definition-heading"
    >
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24 lg:px-8">
        <p className="text-base/7 font-semibold">What this product is</p>
        <h2
          id="about-product-definition-heading"
          className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          {APP_NAME} in one paragraph
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-pretty text-muted-foreground">
          <strong className="font-semibold text-foreground">{APP_NAME}</strong>{" "}
          ({SITE_WWW_HOST}) is a web app that runs a guided{" "}
          <strong className="font-semibold text-foreground">
            cat naming ceremony
          </strong>
          . You upload a photo and describe your cat&apos;s personality; the
          app drafts an editable summary, then helps you discover three names
          inspired by T.&nbsp;S.&nbsp;Eliot&apos;s{" "}
          <em className="text-foreground/90">The Naming of Cats</em>: an
          everyday family name, a cat-world name claimed uniquely on the
          platform, and a poetic guess at the secret ineffable name. It
          finishes with a downloadable keepsake certificate. It is free to
          start, and during beta the full unlock is free too.
        </p>
        <ul className="mt-8 list-disc space-y-3 pl-5 text-base leading-relaxed text-pretty text-muted-foreground">
          <li>
            Best for owners who want personality-based names, not a random
            list — including new kittens, rescues, and cats who already have a
            household nickname.
          </li>
          <li>
            Also useful if you searched for a{" "}
            <Link
              href="/cat-name-generator"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              cat name generator
            </Link>{" "}
            or{" "}
            <Link
              href="/unique-cat-names"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              unique cat names
            </Link>
            , and want a ceremony and certificate at the end.
          </li>
          <li>
            Not a veterinary service, and not a dump of thousands of
            unfiltered name suggestions.
          </li>
        </ul>
      </div>
    </section>
  )
}
