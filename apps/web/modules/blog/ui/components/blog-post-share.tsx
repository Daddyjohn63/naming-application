"use client"

import { Copy, Share2 } from "lucide-react"
import * as React from "react"

import { dataComponent } from "@/lib/data-component"
import { absoluteUrl } from "@/lib/seo/metadata"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"

type BlogPostShareProps = {
  title: string
  /** Site path beginning with `/`, used to build the public share URL. */
  path: string
  text?: string
}

export function BlogPostShare({ title, path, text }: BlogPostShareProps) {
  const [canNativeShare, setCanNativeShare] = React.useState(false)
  const url = absoluteUrl(path)

  React.useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function")
  }, [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied.")
    } catch {
      toast.error("Couldn’t copy the link. Please copy it manually.")
    }
  }

  const onNativeShare = async () => {
    if (typeof navigator.share !== "function") {
      return
    }

    try {
      await navigator.share({
        title,
        ...(text ? { text } : {}),
        url,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }
      toast.error("Couldn’t open the share sheet.")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          {...dataComponent("BlogPostShare")}
          variant="ghost"
          size="icon"
          aria-label="Share this post"
        >
          <Share2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        {canNativeShare ? (
          <DropdownMenuItem onSelect={() => void onNativeShare()}>
            <Share2 />
            Share
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => void onCopy()}>
          <Copy />
          Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
