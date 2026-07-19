import Link from "next/link"
import type { ComponentProps } from "react"

import { APP_NAME } from "@workspace/shared/constants/app"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"
import { LogoMarkPaths } from "./marks/logo-mark"

type LogoProps = React.SVGProps<SVGSVGElement>

/** Theme-aware logo mark; fill follows `--foreground` via `currentColor`. */
export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      {...dataComponent("Logo")}
      viewBox="0 0 2000 2000"
      fill="currentColor"
      aria-hidden
      className={cn("size-[78px] shrink-0", className)}
      {...props}
    >
      <LogoMarkPaths />
    </svg>
  )
}

type LogoLinkProps = ComponentProps<typeof Link> & {
  logoClassName?: string
  /** Show the product name beside the mark (public pages). */
  showName?: boolean
}

/** Home link with logo mark and screen-reader label. */
export function LogoLink({
  className,
  logoClassName,
  showName = false,
  ...props
}: LogoLinkProps) {
  return (
    <Link
      {...dataComponent("LogoLink")}
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 text-foreground",
        showName
          ? "transition-opacity hover:opacity-90"
          : "transition-colors hover:text-primary",
        className
      )}
      {...props}
    >
      <Logo className={logoClassName} />
      {showName ? (
        <span
          className={cn(
            "bg-linear-to-r from-primary via-chart-2 to-chart-3 bg-clip-text",
            "text-2xl font-semibold tracking-tight text-transparent whitespace-nowrap"
          )}
        >
          {APP_NAME}
        </span>
      ) : (
        <span className="sr-only">{APP_NAME}</span>
      )}
    </Link>
  )
}
