import { ImageResponse } from "next/og"

import { APP_NAME } from "@workspace/shared/constants/app"
import { SITE_DOMAIN, SITE_TAGLINE } from "@workspace/shared/constants/site"

import { fetchPublicCertificate } from "@/lib/convex/http"

export const alt = `${APP_NAME} naming certificate`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type OpenGraphImageProps = {
  params: Promise<{ shareId: string }>
}

/** Per-share social preview — parchment card with everyday name when public. */
export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { shareId } = await params
  const certificate = await fetchPublicCertificate(shareId)
  const everydayName = certificate?.everydayName
  const headline =
    everydayName !== undefined && everydayName.length > 0
      ? `${everydayName}'s naming certificate`
      : APP_NAME
  const subline =
    everydayName !== undefined && everydayName.length > 0
      ? "Family · Cat-world · Ineffable"
      : SITE_TAGLINE

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(145deg, #FAF6EF 0%, #F3E9D8 55%, #E8D7B8 100%)",
          color: "#0F1B2D",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 28,
            letterSpacing: "0.04em",
            color: "#8B6F47",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#C9A45C",
            }}
          />
          {SITE_DOMAIN}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: everydayName !== undefined ? 64 : 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 920,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              color: "#3D2E1F",
              maxWidth: 860,
            }}
          >
            {subline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            color: "#8B6F47",
          }}
        >
          <span>Created by {SITE_DOMAIN}</span>
          <span style={{ color: "#C9A45C", fontWeight: 600 }}>{APP_NAME}</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
