"use client"

/**
 * KB-011 — client-side certificate PDF/PNG pipeline.
 *
 * First generate (AC: `ceremony_complete` only after the PDF path succeeded):
 * capture HTML → build PDF → upload blob to Convex storage → `completeCeremony`.
 * No browser download on first generate — the page then reveals Share with
 * friends plus Download PDF / Download PNG. Re-downloads skip the
 * upload/mutation. PNG download never marks the ceremony complete.
 */

import * as React from "react"
import { useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { toast } from "@workspace/ui/components/sonner"

import { useReportClientError } from "@/lib/use-report-client-error"

/**
 * Convex storage photos are cross-origin; inlining them as data URLs keeps the
 * PDF capture from silently dropping the image. Falls back to the raw URL so
 * the on-screen preview still renders if the fetch fails.
 */
export function useCertificatePhotoDataUrl(
  photoUrl: string | undefined,
): string | undefined {
  const [src, setSrc] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    if (photoUrl === undefined) {
      setSrc(undefined)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch(photoUrl)
        if (!response.ok) {
          throw new Error(`Photo fetch failed (${response.status})`)
        }
        const blob = await response.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error("Photo read failed"))
          reader.readAsDataURL(blob)
        })
        if (!cancelled) {
          setSrc(dataUrl)
        }
      } catch {
        if (!cancelled) {
          setSrc(photoUrl)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [photoUrl])

  return src
}

function certificateSlug(everydayName: string): string {
  const slug = everydayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug.length > 0 ? slug : "cat"
}

function certificateFileName(everydayName: string, extension: "pdf" | "png"): string {
  return `${certificateSlug(everydayName)}-naming-certificate.${extension}`
}

function triggerBrowserDownload(dataUrl: string, fileName: string): void {
  const anchor = document.createElement("a")
  anchor.href = dataUrl
  anchor.download = fileName
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

type UseCertificateDownloadArgs = {
  catId: string
  everydayName: string
  /** Already `ceremony_complete` — re-download only, no upload/mutation. */
  alreadyComplete: boolean
  captureRef: React.RefObject<HTMLDivElement | null>
  /** Fired after `completeCeremony` succeeds (first generate only). */
  onCeremonyComplete?: () => void
}

export function useCertificateDownload({
  catId,
  everydayName,
  alreadyComplete,
  captureRef,
  onCeremonyComplete,
}: UseCertificateDownloadArgs) {
  const generateUploadUrl = useMutation(api.cats.generateUploadUrl)
  const completeCeremony = useMutation(api.certificate.completeCeremony)
  const reportClientError = useReportClientError()
  const [working, setWorking] = React.useState(false)

  const capturePng = React.useCallback(async () => {
    const node = captureRef.current
    if (node === null) {
      throw new Error("Certificate is not ready to capture yet.")
    }
    const { toPng } = await import("html-to-image")
    return {
      width: node.offsetWidth,
      height: node.offsetHeight,
      imageDataUrl: await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#fdf9f0",
      }),
    }
  }, [captureRef])

  const downloadPdf = React.useCallback(async () => {
    if (working) {
      return
    }
    setWorking(true)
    try {
      const [{ jsPDF }, captured] = await Promise.all([
        import("jspdf"),
        capturePng(),
      ])

      const { width, height, imageDataUrl } = captured
      const pdf = new jsPDF({
        orientation: height >= width ? "portrait" : "landscape",
        unit: "px",
        format: [width, height],
        hotfixes: ["px_scaling"],
      })
      pdf.addImage(imageDataUrl, "PNG", 0, 0, width, height)

      // Re-download after ceremony is already complete — save to disk only.
      if (alreadyComplete) {
        pdf.save(certificateFileName(everydayName, "pdf"))
        toast.success("Certificate downloaded.")
        return
      }

      // First generate: persist + complete the ceremony before any download.
      // The UI then shows Share with friends and Download PDF / PNG.
      const pdfBlob = pdf.output("blob")
      const uploadUrl = await generateUploadUrl({})
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: pdfBlob,
      })
      if (!uploadResponse.ok) {
        throw new Error("Certificate upload failed — please try again.")
      }
      const { storageId } = (await uploadResponse.json()) as {
        storageId: Id<"_storage">
      }

      await completeCeremony({ catId, certificateStorageId: storageId })
      toast.success("Ceremony complete — your certificate is ready!")
      onCeremonyComplete?.()
    } catch (error) {
      console.error("Certificate generation failed", error)
      toast.error(getConvexErrorMessage(error))
      reportClientError({
        area: "certificate.downloadPdf",
        error,
        catId,
        meta: { operation: "useCertificateDownload.downloadPdf" },
      })
    } finally {
      setWorking(false)
    }
  }, [
    alreadyComplete,
    capturePng,
    catId,
    completeCeremony,
    everydayName,
    generateUploadUrl,
    onCeremonyComplete,
    reportClientError,
    working,
  ])

  const downloadPng = React.useCallback(async () => {
    if (working) {
      return
    }
    setWorking(true)
    try {
      const { imageDataUrl } = await capturePng()
      triggerBrowserDownload(
        imageDataUrl,
        certificateFileName(everydayName, "png"),
      )
      toast.success("Certificate image downloaded.")
    } catch (error) {
      console.error("Certificate PNG download failed", error)
      toast.error(getConvexErrorMessage(error))
      reportClientError({
        area: "certificate.downloadPng",
        error,
        catId,
        meta: { operation: "useCertificateDownload.downloadPng" },
      })
    } finally {
      setWorking(false)
    }
  }, [capturePng, catId, everydayName, reportClientError, working])

  return { working, downloadPdf, downloadPng }
}
