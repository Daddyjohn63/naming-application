import { ConvexHttpClient } from "convex/browser"

import { api } from "@workspace/backend/_generated/api"
import type { FunctionReturnType } from "convex/server"

export type PublicCertificate = NonNullable<
  FunctionReturnType<typeof api.certificate.getPublicCertificate>
>

function createConvexHttpClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (url === undefined || url === "") {
    return null
  }
  return new ConvexHttpClient(url)
}

/** Server-side fetch of a publicly shared certificate (null if private/missing). */
export async function fetchPublicCertificate(
  shareId: string,
): Promise<PublicCertificate | null> {
  const client = createConvexHttpClient()
  if (client === null) {
    console.warn(
      "fetchPublicCertificate: NEXT_PUBLIC_CONVEX_URL is missing; returning null.",
    )
    return null
  }

  try {
    return await client.query(api.certificate.getPublicCertificate, { shareId })
  } catch (error) {
    console.error("fetchPublicCertificate: query failed", error)
    return null
  }
}
