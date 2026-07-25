import type { MetadataRoute } from "next"

import { APP_NAME } from "@workspace/shared/constants/app"
import {
  SITE_DESCRIPTION,
  SITE_TAGLINE,
} from "@workspace/shared/constants/site"

/** Web app manifest for install / browser metadata. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: `${SITE_TAGLINE}. ${SITE_DESCRIPTION}`,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EF",
    theme_color: "#0F1B2D",
    lang: "en-GB",
    categories: ["lifestyle", "entertainment"],
    icons: [
      {
        src: "/images/favicon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}