import type { Metadata } from "next"

import { ExamplesView } from "@/modules/examples/ui/views/examples-view"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata: Metadata = {
  title: `Examples — ${APP_NAME}`,
  description: `Browse sample ${APP_NAME} certificates — photo, personality profile, and all three names on a keepsake you can enlarge and step through.`,
}

export default function ExamplesPage() {
  return <ExamplesView />
}
