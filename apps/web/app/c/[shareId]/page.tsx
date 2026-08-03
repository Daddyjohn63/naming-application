import type { Metadata } from "next"

import { APP_NAME } from "@workspace/shared/constants/app"

import { fetchPublicCertificate } from "@/lib/convex/http"
import { absoluteUrl, createPageMetadata } from "@/lib/seo/metadata"
import { PublicCertificateView } from "@/modules/ceremony/ui/views/public-certificate-view"

type PublicCertificatePageProps = {
  params: Promise<{ shareId: string }>
}

export async function generateMetadata({
  params,
}: PublicCertificatePageProps): Promise<Metadata> {
  const { shareId } = await params
  const certificate = await fetchPublicCertificate(shareId)

  if (certificate === null) {
    return createPageMetadata({
      title: "Certificate unavailable",
      description: `This ${APP_NAME} certificate link is private or unavailable.`,
      path: `/c/${shareId}`,
      robots: { index: false, follow: false },
    })
  }

  const title = `${certificate.everydayName}'s naming certificate`
  const description = `See ${certificate.everydayName}'s naming ceremony keepsake on ${APP_NAME} — family, cat-world, and ineffable names.`
  const path = `/c/${shareId}`
  const ogImagePath = `${path}/opengraph-image`

  return {
    ...createPageMetadata({
      title,
      description,
      path,
      robots: { index: false, follow: false },
    }),
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      url: absoluteUrl(path),
      siteName: APP_NAME,
      locale: "en_GB",
      type: "website",
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${APP_NAME}`,
      description,
      images: [{ url: ogImagePath, alt: title }],
    },
  }
}

export default function PublicCertificatePage() {
  return <PublicCertificateView />
}
