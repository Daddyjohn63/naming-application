import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import { LandingHero } from "@/modules/landing/ui/components/landing-hero"
import { dataComponent } from "@/lib/data-component"

/** Marketing landing for KB-001 — public funnel entry before Clerk sign-up. */
export function LandingView() {
  return (
    <main {...dataComponent("LandingView")} className="flex flex-1 flex-col">
      <LandingHero />

      {/* <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 md:gap-14 md:py-20 lg:gap-16">
        <Separator />

        <section className="grid gap-4 md:grid-cols-2 md:gap-6">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">What you&apos;ll do</CardTitle>
              <CardDescription>
                You bring the story — we scaffold the funnel and AI touches
                where the product allows.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>After you enter</CardTitle>
              <CardDescription>
                You&apos;ll land in your dashboard to add cats and continue the
                ceremony from the last saved step.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div> */}
    </main>
  )
}
