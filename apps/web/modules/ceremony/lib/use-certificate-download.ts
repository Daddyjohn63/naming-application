"use client"

/**
 * KB-011 — client-side certificate PDF pipeline.
 *
 * Order matters (AC: `ceremony_complete` only after the PDF path succeeded):
 * capture HTML → build PDF → trigger local download → mint certificate upload URL →
 * upload blob → register on ledger (PDF validation) → `completeCeremony`.
 * Re-downloads on completed ceremonies skip the upload/mutation (the mutation is
 * idempotent anyway).
 */

import * as React from "react"
import { useAction, useMutation } from "convex/react"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { toast } from "@workspace/ui/components/sonner"

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

function certificateFileName(everydayName: string): string {
  const slug = everydayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${slug.length > 0 ? slug : "cat"}-naming-certificate.pdf`
}

type UseCertificateDownloadArgs = {
  catId: string
  everydayName: string
  /** Already `ceremony_complete` — re-download only, no upload/mutation. */
  alreadyComplete: boolean
  captureRef: React.RefObject<HTMLDivElement | null>
}

export function useCertificateDownload({
  catId,
  everydayName,
  alreadyComplete,
  captureRef,
}: UseCertificateDownloadArgs) {
  const generateCertificateUploadUrl = useMutation(
    api.certificate.generateCertificateUploadUrl,
  )
  const registerCertificateUpload = useAction(
    api.certificateActions.registerCertificateUpload,
  )
  const completeCeremony = useMutation(api.certificate.completeCeremony)
  const [working, setWorking] = React.useState(false)

  const download = React.useCallback(async () => {
    const node = captureRef.current
    if (node === null || working) {
      return
    }
    setWorking(true)
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ])

      const width = node.offsetWidth
      const height = node.offsetHeight
      const imageDataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#fdf9f0",
      })

      const pdf = new jsPDF({
        orientation: height >= width ? "portrait" : "landscape",
        unit: "px",
        format: [width, height],
        hotfixes: ["px_scaling"],
      })
      pdf.addImage(imageDataUrl, "PNG", 0, 0, width, height)
      pdf.save(certificateFileName(everydayName))

      if (alreadyComplete) {
        toast.success("Certificate downloaded.")
        return
      }

      const pdfBlob = pdf.output("blob")
      const uploadUrl = await generateCertificateUploadUrl({ catId })
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

      await registerCertificateUpload({ catId, storageId })
      await completeCeremony({ catId, certificateStorageId: storageId })
      toast.success("Ceremony complete — your certificate is ready!")
    } catch (error) {
      console.error("Certificate generation failed", error)
      toast.error(getConvexErrorMessage(error))
    } finally {
      setWorking(false)
    }
  }, [
    alreadyComplete,
    captureRef,
    catId,
    completeCeremony,
    everydayName,
    generateCertificateUploadUrl,
    registerCertificateUpload,
    working,
  ])

  return { working, download }
}
