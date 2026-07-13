import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"
import { FeatureList } from "@/modules/landing/ui/components/feature-list"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

const FREE_FEATURES = [
  "Cat profile with required photo and personality description",
  "Photo check and personality summary — edit until it's right",
  "Family name styles: Elegant, Silly, Classic, Nature-inspired, and more",
  "10 family names with rationales, plus one free regeneration",
  "Shortlist up to six names and crown a favourite family name",
  "Pause any time — progress is saved at every step",
] as const

const UNLOCK_FEATURES = [
  "Everything in the free ceremony",
  "Cat-world name — globally unique, claimed for your cat alone",
  "Ineffable near-name — a poetic guess at their secret name",
  "One free regeneration at each unlocked stage",
  "Keepsake certificate with all three names",
  "PDF download to print, share, or frame",
] as const

/** Free-vs-unlock pricing cards: the ceremony is free to start, $3.99 per cat to finish. */
export function PricingSection() {
  return (
    <section
      id="pricing"
      {...dataComponent("PricingSection")}
      className="w-full scroll-mt-16 border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base/7 font-semibold">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Free to begin. One small payment to finish.
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            No subscription, no bundle, no surprises. Everything up to your
            cat&apos;s family name is free — unlock the rest of the ceremony
            only if you fall in love with it.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2 md:gap-8">
          <Card className="bg-card">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl">Start the ceremony</CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight">
                  Free
                </span>
              </div>
              <CardDescription className="text-base">
                Meet your cat&apos;s personality summary and find their everyday
                family name — no card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureList features={FREE_FEATURES} itemClassName="text-sm" />
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/sign-up">Start for free</Link>
              </Button>
            </CardFooter>
          </Card>

          <div className="relative">
            <Badge className="absolute -top-3 left-6 z-10 rounded-full px-3 py-0.5">
              The full ceremony
            </Badge>
            <Card className="h-full bg-card shadow-lg ring-primary/40">
              <CardHeader className="gap-2">
                <CardTitle className="text-xl">
                  Unlock all three names
                </CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight">
                    {UNLOCK_PRICE_USD}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    one-time, per cat
                  </span>
                </div>
                <CardDescription className="text-base">
                  Complete the ceremony with the cat-world name, the ineffable
                  near-name, and the certificate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureList
                  features={UNLOCK_FEATURES}
                  itemClassName="text-sm"
                />
              </CardContent>
              <CardFooter className="mt-auto">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/sign-up">Begin the naming ceremony</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-pretty text-muted-foreground">
          You&apos;re only charged when you choose to unlock — never at sign-up,
          and never automatically. Each cat&apos;s ceremony is its own unlock,
          so a household of three cats is three ceremonies (and three
          certificates).
        </p>
      </div>
    </section>
  )
}
