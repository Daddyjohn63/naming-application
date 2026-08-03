"use client"

/**
 * Opt-in public share controls for a completed certificate.
 * Default off — owners must enable before `/c/[shareId]` is readable.
 */

import * as React from "react"
import { useMutation } from "convex/react"
import { Check, Copy, Link2, Share2 } from "lucide-react"

import { api } from "@workspace/backend/_generated/api"
import { getConvexErrorMessage } from "@workspace/shared/utils/convex-error"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { toast } from "@workspace/ui/components/sonner"

import { dataComponent } from "@/lib/data-component"
import { absoluteUrl } from "@/lib/seo/metadata"

type CertificateSharePanelProps = {
  catId: string
  everydayName: string
  shareEnabled: boolean
  shareId: string | undefined
}

export function CertificateSharePanel({
  catId,
  everydayName,
  shareEnabled,
  shareId,
}: CertificateSharePanelProps) {
  const setCertificateSharing = useMutation(api.certificate.setCertificateSharing)
  const [pending, setPending] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [canNativeShare, setCanNativeShare] = React.useState(false)

  const shareUrl =
    shareEnabled && shareId !== undefined
      ? absoluteUrl(`/c/${shareId}`)
      : undefined

  React.useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function")
  }, [])

  const onToggle = async (enabled: boolean) => {
    if (pending) {
      return
    }
    setPending(true)
    try {
      await setCertificateSharing({ catId, enabled })
      toast.success(
        enabled
          ? "Sharing on — anyone with the link can view this certificate."
          : "Sharing off — the link no longer works.",
      )
    } catch (error) {
      toast.error(getConvexErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  const onCopy = async () => {
    if (shareUrl === undefined) {
      return
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied.")
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn’t copy the link. Please copy it manually.")
    }
  }

  const onNativeShare = async () => {
    if (shareUrl === undefined || typeof navigator.share !== "function") {
      return
    }
    try {
      await navigator.share({
        title: `${everydayName}'s naming certificate`,
        text: `See ${everydayName}'s naming certificate`,
        url: shareUrl,
      })
    } catch (error) {
      // User dismissed the sheet — not an error worth toasting.
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }
      toast.error("Couldn’t open the share sheet.")
    }
  }

  return (
    <div
      {...dataComponent("CertificateSharePanel")}
      className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-muted/30 px-4 py-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 shrink-0 text-primary" aria-hidden />
            <Label htmlFor="certificate-share-toggle" className="text-sm font-medium">
              Share with friends
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Off by default. When on, anyone with the link can see the photo,
            summary, and three names.
          </p>
        </div>
        <Switch
          id="certificate-share-toggle"
          checked={shareEnabled}
          disabled={pending}
          onCheckedChange={(checked) => {
            void onToggle(checked)
          }}
          aria-label="Share certificate with friends"
        />
      </div>

      {shareUrl !== undefined ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="certificate-share-url" className="text-xs text-muted-foreground">
            Public link
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="certificate-share-url"
              readOnly
              value={shareUrl}
              className="font-mono text-xs"
              onFocus={(event) => event.currentTarget.select()}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-primary/30"
                disabled={pending}
                onClick={() => void onCopy()}
              >
                {copied ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              {canNativeShare && shareUrl !== undefined ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary/30"
                  disabled={pending}
                  onClick={() => void onNativeShare()}
                >
                  <Share2 className="size-4" aria-hidden />
                  Share
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
