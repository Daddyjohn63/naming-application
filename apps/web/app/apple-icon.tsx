import { readFileSync } from "node:fs"
import { join } from "node:path"

import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** Apple touch icon — raster of the parchment + Artboard mark favicon. */
export default function AppleIcon() {
  const svg = readFileSync(
    join(process.cwd(), "public", "images", "favicon.svg"),
    "utf8"
  )
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6EF",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse only supports <img> */}
        <img src={src} alt="" width={180} height={180} />
      </div>
    ),
    { ...size }
  )
}
