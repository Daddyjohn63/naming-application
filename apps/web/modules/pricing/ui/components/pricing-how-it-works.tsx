import { dataComponent } from "@/lib/data-component"
import { UNLOCK_PRICE_USD } from "@/modules/landing/lib/pricing"

const PRICING_POINTS = [
  {
    title: "Start free — no card needed",
    body: "Create an account, add a cat, build their profile, review the personality summary, and choose their everyday family name. All of that is free.",
  },
  {
    title: "Unlock only when you’re ready",
    body: `When you want the cat-world name, the ineffable near-name, and the keepsake certificate, unlock that ceremony for a one-time ${UNLOCK_PRICE_USD} (USD). Payment stays on the ceremony page — you don’t get sent elsewhere.`,
  },
  {
    title: "One unlock per cat",
    body: "Each cat has their own ceremony. Unlocking one does not unlock the others. A household of three cats means three ceremonies — and three certificates if you finish them all.",
  },
  {
    title: "No subscription, no surprise renewals",
    body: "You’re only charged when you choose Unlock. There’s no monthly plan, no trial that converts, and no automatic charge after sign-up.",
  },
] as const

/** Plain-language explanation of free vs unlock pricing. */
export function PricingHowItWorks() {
  return (
    <section
      {...dataComponent("PricingHowItWorks")}
      className="w-full border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base/7 font-semibold">How pricing works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Pay for the ending, not for getting started
          </h2>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            The idea is simple: fall in love with the ceremony first. Unlock
            the rest only if you want all three names and the certificate.
          </p>
        </div>

        <ol className="mx-auto mt-14 grid max-w-4xl list-none gap-8 sm:grid-cols-2">
          {PRICING_POINTS.map((point, index) => (
            <li key={point.title} className="flex flex-col gap-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Step {index + 1}
              </p>
              <h3 className="text-xl font-semibold tracking-tight">
                {point.title}
              </h3>
              <p className="text-base leading-relaxed text-pretty text-muted-foreground">
                {point.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
