"use client"

import { useState } from "react"

import { dataComponent } from "@/lib/data-component"
import { CeremonyCertificateDocument } from "@/modules/ceremony/ui/components/ceremony-certificate-document"
import {
  EXAMPLE_CERTIFICATES,
  type ExampleCertificate,
} from "@/modules/examples/lib/example-certificates"
import { ExamplesCertificateLightbox } from "@/modules/examples/ui/components/examples-certificate-lightbox"

type CertificatePreviewCardProps = {
  certificate: ExampleCertificate
  onOpen: () => void
}

function CertificatePreviewCard({
  certificate,
  onOpen,
}: CertificatePreviewCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-2xl border border-[#e7dcc4]/90 bg-[#fdf9f0] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`View certificate for ${certificate.everydayName}`}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-0 w-[200%] origin-top-left scale-50 select-none">
          <CeremonyCertificateDocument
            data={certificate}
            className="rounded-none border-0 shadow-none"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#fdf9f0] via-[#fdf9f0]/95 to-transparent px-5 pt-16 pb-5"
        >
          <p className="font-serif text-xl font-semibold text-[#9a6b32]">
            {certificate.everydayName}
          </p>
          <p className="mt-1 text-sm text-[#8a7658] transition-colors group-hover:text-[#6f5c3f]">
            Click to enlarge
          </p>
        </div>
      </div>
    </button>
  )
}

/** Two-up certificate gallery with lightbox enlarge / next-prev browsing. */
export function ExamplesGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section
      {...dataComponent("ExamplesGallery")}
      className="w-full border-b border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Six sample ceremonies
          </h2>
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
            Real certificate layouts with sample cats — the same keepsake you
            receive when your naming ceremony is complete.
          </p>
        </div>

        <ul className="mt-12 grid list-none grid-cols-1 gap-8 p-0 md:grid-cols-2 md:gap-10">
          {EXAMPLE_CERTIFICATES.map((certificate, index) => (
            <li key={certificate.id}>
              <CertificatePreviewCard
                certificate={certificate}
                onOpen={() => setActiveIndex(index)}
              />
            </li>
          ))}
        </ul>
      </div>

      <ExamplesCertificateLightbox
        certificates={EXAMPLE_CERTIFICATES}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    </section>
  )
}
