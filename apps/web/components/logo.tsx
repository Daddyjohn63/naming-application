import Link from "next/link"
import type { ComponentProps } from "react"

//import { LogoMarkPaths } from "@/components/marks/logo-mark"
import { dataComponent } from "@/lib/data-component"
import { cn } from "@workspace/ui/lib/utils"
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
      className={cn("size-12 shrink-0", className)}
      {...props}
    >
      <LogoMarkPaths />
    </svg>
  )
}

type LogoLinkProps = ComponentProps<typeof Link> & {
  logoClassName?: string
}

/** Home link with logo mark and screen-reader label. */
export function LogoLink({
  className,
  logoClassName,
  ...props
}: LogoLinkProps) {
  return (
    <Link
      {...dataComponent("LogoLink")}
      className={cn(
        "inline-flex shrink-0 items-center text-foreground transition-colors hover:text-primary",
        className
      )}
      {...props}
    >
      <Logo className={logoClassName} />
      <span className="sr-only">Naming Buddy</span>
    </Link>
  )
}
