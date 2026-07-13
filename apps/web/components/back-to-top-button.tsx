"use client"

import { ChevronUp } from "lucide-react"
import * as React from "react"

import { dataComponent } from "@/lib/data-component"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const SHOW_AFTER_SCROLL_PX = 400

/** Fixed bottom-right control that smooth-scrolls back to the top of the page. */
export function BackToTopButton() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    function updateVisibility() {
      setVisible(window.scrollY > SHOW_AFTER_SCROLL_PX)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })
    return () => {
      window.removeEventListener("scroll", updateVisibility)
    }
  }, [])

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label="Back to top"
      {...dataComponent("BackToTopButton")}
      onClick={handleClick}
      className={cn(
        "fixed right-4 bottom-4 z-40 size-11 rounded-full border-0 bg-[oklch(0.804_0.081_74.925)] text-black shadow-md transition-[opacity,transform,background-color] duration-200 hover:bg-[oklch(0.76_0.09_74.925)] hover:text-black md:right-6 md:bottom-6",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <ChevronUp className="size-5 text-black" aria-hidden />
    </Button>
  )
}
