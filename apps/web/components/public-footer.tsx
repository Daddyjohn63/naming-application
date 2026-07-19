import Link from "next/link"

import { LogoLink } from "@/components/logo"
import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"

const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms & Conditions" },
] as const

export function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      {...dataComponent("PublicFooter")}
      className="mt-auto border-t border-border/50 bg-muted/20"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <LogoLink href="/" showName />
          <p className="text-muted-foreground text-sm">
            © {year} {APP_NAME}. All rights reserved.
          </p>
        </div>

        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
