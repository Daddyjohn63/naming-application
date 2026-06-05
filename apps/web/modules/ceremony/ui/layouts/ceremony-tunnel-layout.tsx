"use client"

import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

type CeremonyTunnelLayoutProps = {
  main: React.ReactNode
  sidebar?: React.ReactNode | null
  className?: string
}

/**
 * KB-006A — guided tunnel: main column + compact unlock sidebar (~16rem).
 * Stacks vertically on narrow viewports (sidebar below main).
 */
export function CeremonyTunnelLayout({
  main,
  sidebar,
  className,
}: CeremonyTunnelLayoutProps) {
  return (
    <div
      {...dataComponent("CeremonyTunnelLayout")}
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 lg:flex-row lg:items-start lg:gap-8",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-8">{main}</div>
      {sidebar !== undefined && sidebar !== null ? (
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-20 lg:w-64 lg:max-w-64 lg:flex-none">
          {sidebar}
        </aside>
      ) : null}
    </div>
  )
}
