import type { Metadata } from "next"

import { PrivacyView } from "@/modules/legal/ui/views/privacy-view"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata: Metadata = {
  title: `Privacy — ${APP_NAME}`,
  description: `How ${APP_NAME} collects, uses, and protects your information, including cookies and third-party services.`,
}

export default function PrivacyPage() {
  return <PrivacyView />
}
