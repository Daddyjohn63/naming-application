import Image from "next/image"

import { dataComponent } from "@/lib/data-component"
import { FeatureList } from "@/modules/landing/ui/components/feature-list"

const CERTIFICATE_FEATURES = [
  "Their photo, front and centre on a parchment keepsake",
  "The personality summary — Your Cat's Profile — written from your words and their photo",
  "All three names — family, cat-world, and ineffable — with their meanings",
  "The date of the ceremony, sealed for posterity",
  "Download as PDF to print or frame, or PNG for easy sharing",
  "An optional private link you can share with friends",
  "Reopen it from your dashboard whenever you miss it",
] as const

/** Two-column showcase of the keepsake certificate produced at the end of the ceremony. */
export function CertificateShowcase() {
  return (
    <section
      {...dataComponent("CertificateShowcase")}
      className="w-full border-b border-border/40 bg-muted/30"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 sm:py-32 md:grid-cols-2 md:gap-16 lg:px-8">
        <div className="order-2 flex items-center justify-center md:order-1">
          <div className="relative aspect-3/4 w-full max-w-sm -rotate-2 overflow-hidden rounded-2xl border-4 border-white bg-[#fdf9f0] shadow-2xl transition-transform duration-300 hover:rotate-0">
            <Image
              src="/images/certificate-willow.png"
              alt="Example Completed Cat Profile certificate showing a cat's photo, personality summary, and three names"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        </div>

        <div className="order-1 flex flex-col gap-6 md:order-2">
          <p className="text-base/7 font-semibold">What you take away</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            A Completed Cat Profile, made just for your cat
          </h2>
          <p className="text-lg text-pretty text-muted-foreground">
            The ceremony ends with a certificate that gathers everything in one
            place — proof, at last, that your cat is exactly who they always
            suspected they were.
          </p>
          <FeatureList features={CERTIFICATE_FEATURES} />
        </div>
      </div>
    </section>
  )
}
