"use client"

/**
 * Theatrical wait state for first certificate generate — dims the page and
 * shows the Feline Registry art while the PDF is captured and stored.
 */

import Image from "next/image"

import { Spinner } from "@workspace/ui/components/spinner"

import { dataComponent } from "@/lib/data-component"

type CertificateRecordingOverlayProps = {
  open: boolean
}

export function CertificateRecordingOverlay({
  open,
}: CertificateRecordingOverlayProps) {
  if (!open) {
    return null
  }

  return (
    <div
      {...dataComponent("CertificateRecordingOverlay")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-labelledby="certificate-recording-label"
    >
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-xl sm:p-5">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border/40">
          <Image
            src="/images/registry-office.png"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        </div>
        <div className="flex flex-col items-center gap-3 px-1 pb-1 text-center">
          <p
            id="certificate-recording-label"
            className="font-serif text-lg leading-snug text-foreground sm:text-xl"
          >
            The Office of Distinguished Names is recording your cat…
          </p>
          <Spinner className="size-5 text-primary" aria-hidden />
        </div>
      </div>
    </div>
  )
}
