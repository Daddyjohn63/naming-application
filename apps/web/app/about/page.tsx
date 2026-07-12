import type { Metadata } from "next"

import { AboutView } from "@/modules/about/ui/views/about-view"

export const metadata: Metadata = {
  title: "About — Naming Buddy",
  description:
    "Meet Naming Buddy: a cat naming ceremony inspired by T. S. Eliot and sparked by Andrew Lloyd Webber's Cats — built by people who love cats.",
}

export default function AboutPage() {
  return <AboutView />
}
