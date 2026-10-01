import type { Metadata } from "next"

import { APP_NAME } from "@workspace/shared/constants/app"
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_OG_IMAGE_ALT,
  SITE_TAGLINE,
  SITE_URL,
} from "@workspace/shared/constants/site"

type PageSocialImage = {
  url: string
  alt: string
  width?: number
  height?: number
}

type CreatePageMetadataOptions = {
  /** Short page title; root template appends `| ${APP_NAME}` unless `absoluteTitle`. */
  title: string
  description: string
  /** Path beginning with `/` (e.g. `/about`). Use `/` for the home page. */
  path: string
  keywords?: readonly string[]
  /** When true, use `title` as the full document title (no template suffix). */
  absoluteTitle?: boolean
  robots?: Metadata["robots"]
  openGraphType?: "website" | "article"
  /** Replaces the site default `/opengraph-image` on Open Graph and Twitter. */
  image?: PageSocialImage
}

/** Absolute URL for a site path. */
export function absoluteUrl(path: string = "/"): string {
  if (path === "/" || path === "") return SITE_URL
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

/**
 * Builds consistent page metadata: canonical, Open Graph, Twitter, and robots.
 * Root layout supplies `metadataBase`, title template, and default OG image.
 */
export function createPageMetadata({
  title,
  description,
  path,
  keywords = SITE_KEYWORDS,
  absoluteTitle = false,
  robots,
  openGraphType = "website",
  image,
}: CreatePageMetadataOptions): Metadata {
  const url = absoluteUrl(path)
  const documentTitle = absoluteTitle ? { absolute: title } : title
  const socialTitle = absoluteTitle ? title : `${title} | ${APP_NAME}`
  const openGraphImage = image
    ? {
        url: image.url,
        alt: image.alt,
        ...(image.width !== undefined ? { width: image.width } : {}),
        ...(image.height !== undefined ? { height: image.height } : {}),
      }
    : {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_OG_IMAGE_ALT,
      }

  return {
    title: documentTitle,
    description,
    keywords: [...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: APP_NAME,
      locale: "en_GB",
      type: openGraphType,
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [
        {
          url: openGraphImage.url,
          alt: openGraphImage.alt,
        },
      ],
    },
    ...(robots !== undefined ? { robots } : {}),
  }
}

/** Root layout metadata shared by every route unless overridden. */
export function createRootMetadata(): Metadata {
  const defaultTitle = `${APP_NAME} — ${SITE_TAGLINE}`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: `%s | ${APP_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: APP_NAME,
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: APP_NAME, url: SITE_URL }],
    creator: APP_NAME,
    publisher: APP_NAME,
    category: "pets",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: defaultTitle,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: APP_NAME,
      locale: "en_GB",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: SITE_OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: "/opengraph-image",
          alt: SITE_OG_IMAGE_ALT,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
  }
}

/** Shared robots directive for authenticated / non-marketing surfaces. */
export const NO_INDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
}
