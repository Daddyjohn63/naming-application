import { APP_NAME } from "@workspace/shared/constants/app"
import {
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  SITE_URL,
} from "@workspace/shared/constants/site"

import { absoluteUrl } from "@/lib/seo/metadata"

type JsonLdValue = Record<string, unknown> | ReadonlyArray<Record<string, unknown>>

type FaqItem = {
  question: string
  answer: string
}

/** Escapes `<` so JSON-LD cannot break out of the script tag. */
function serializeJsonLd(data: JsonLdValue): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

/** Renders one or more Schema.org objects as `application/ld+json`. */
export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}

/** Organization + WebSite graph for the marketing origin. */
export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: APP_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon"),
        },
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: APP_NAME,
        alternateName: SITE_TAGLINE,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "en-GB",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: APP_NAME,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "GBP",
          description:
            "Free to start; unlock is free during beta for the full naming ceremony and certificate.",
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  } as const
}

/** FAQPage schema from marketing FAQ Q&A pairs. */
export function buildFaqPageJsonLd(faqs: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  } as const
}

/** WebPage schema for a public marketing route. */
export function buildWebPageJsonLd({
  path,
  name,
  description,
}: {
  path: string
  name: string
  description: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#app` },
    inLanguage: "en-GB",
  } as const
}
