import type { Metadata } from "next"

import { AboutView } from "@/modules/about/ui/views/about-view"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata: Metadata = {
  title: `About — ${APP_NAME}`,
  description: `Meet ${APP_NAME}: a cat naming ceremony inspired by T. S. Eliot and sparked by Andrew Lloyd Webber's Cats — built by people who love cats.`,
}

export default function AboutPage() {
  return <AboutView />
}
