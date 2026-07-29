"use client"

import type { ReactNode } from "react"
import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
} from "@c15t/nextjs"
import { gtag } from "@c15t/scripts/google-tag"
import { GOOGLE_ANALYTICS_MEASUREMENT_ID } from "@workspace/shared/constants/cookie-third-parties"

const scripts = [
  gtag({
    id: GOOGLE_ANALYTICS_MEASUREMENT_ID,
    category: "measurement",
  }),
]

export function ConsentManager({ children }: { children: ReactNode }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: "offline",
        consentCategories: ["necessary", "measurement"],
        scripts,
        i18n: {
          locale: "en",
          messages: {
            en: {
              common: {
                customize: "Customise",
              },
            },
          },
        },
      }}
    >
      <ConsentBanner />
      <ConsentDialog />
      {children}
    </ConsentManagerProvider>
  )
}
