import type { Metadata } from "next"

import { TermsView } from "@/modules/legal/ui/views/terms-view"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata: Metadata = {
  title: `Terms & Conditions — ${APP_NAME}`,
  description: `Terms governing your use of ${APP_NAME}, including accounts, content, payments, and acceptable use.`,
}

export default function TermsPage() {
  return <TermsView />
}
