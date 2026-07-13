"use client"

import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react"

import { dataComponent } from "@/lib/data-component"
import { CeremonyCertificateDocument } from "@/modules/ceremony/ui/components/ceremony-certificate-document"
import type { ExampleCertificate } from "@/modules/examples/lib/example-certificates"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"

type ExamplesCertificateLightboxProps = {
  certificates: readonly ExampleCertificate[]
  activeIndex: number | null
  onActiveIndexChange: (index: number | null) => void
}

/** Full-size certificate viewer with previous / next navigation. */
export function ExamplesCertificateLightbox({
  certificates,
  activeIndex,
  onActiveIndexChange,
}: ExamplesCertificateLightboxProps) {
  const open = activeIndex !== null
  const certificate =
    activeIndex !== null ? certificates[activeIndex] : undefined
  const count = certificates.length
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const index = activeIndex

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        onActiveIndexChange((index - 1 + count) % count)
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        onActiveIndexChange((index + 1) % count)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activeIndex, count, onActiveIndexChange])

  function goPrevious() {
    if (activeIndex === null) {
      return
    }
    onActiveIndexChange((activeIndex - 1 + count) % count)
  }

  function goNext() {
    if (activeIndex === null) {
      return
    }
    onActiveIndexChange((activeIndex + 1) % count)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onActiveIndexChange(null)
        }
      }}
    >
      <DialogContent
        {...dataComponent("ExamplesCertificateLightbox")}
        showCloseButton={false}
        overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-sm"
        className="flex h-[min(92svh,960px)] w-full max-w-[calc(100%-1.5rem)] flex-col gap-3 overflow-hidden bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {certificate !== undefined
            ? `Certificate for ${certificate.everydayName}`
            : "Certificate preview"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Enlarged sample naming certificate. Use the previous and next buttons
          or arrow keys to browse other examples.
        </DialogDescription>

        <div className="relative flex min-h-0 flex-1 flex-col pt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-4 right-3 z-20 size-9 rounded-full border border-border/60 bg-background/95 shadow-md backdrop-blur-sm sm:right-4"
              aria-label="Close"
            >
              <XIcon className="size-4" aria-hidden />
            </Button>
          </DialogClose>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl shadow-2xl"
          >
            {certificate !== undefined ? (
              <CeremonyCertificateDocument data={certificate} />
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-1 sm:pl-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="pointer-events-auto size-10 rounded-full border border-border/60 bg-background/95 shadow-md backdrop-blur-sm"
              onClick={goPrevious}
              aria-label="Previous certificate"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </Button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-1 sm:pr-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="pointer-events-auto size-10 rounded-full border border-border/60 bg-background/95 shadow-md backdrop-blur-sm"
              onClick={goNext}
              aria-label="Next certificate"
            >
              <ChevronRight className="size-5" aria-hidden />
            </Button>
          </div>
        </div>

        {certificate !== undefined && activeIndex !== null ? (
          <p className="mx-auto mb-1 w-fit shrink-0 rounded-full border border-border/50 bg-background/95 px-4 py-1.5 text-center text-sm text-foreground shadow-md backdrop-blur-sm">
            {certificate.everydayName}
            <span className="mx-2 text-muted-foreground">·</span>
            {activeIndex + 1} of {count}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
