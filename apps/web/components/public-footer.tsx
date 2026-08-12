import Link from "next/link"
import { ConsentDialogLink } from "@c15t/nextjs/components/consent-dialog-link"

import { LogoLink } from "@/components/logo"
import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"

const SITE_LINKS = [
  { href: "/cat-name-generator", label: "Cat name generator" },
  { href: "/unique-cat-names", label: "Unique cat names" },
  { href: "/examples", label: "Examples" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
] as const

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms & Conditions" },
] as const

const footerLinkClassName =
  "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"

export function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      {...dataComponent("PublicFooter")}
      className="mt-auto border-t border-border/50 bg-muted/20"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <LogoLink href="/" showName />
          <p className="text-muted-foreground text-sm">
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Built by{" "}
            <a
              href="https://johnpaulweb.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline-offset-4 transition-colors hover:underline"
            >
              johnpaulweb.dev
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
          <nav
            aria-label="Explore"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:flex-col sm:items-start sm:gap-2"
          >
            {SITE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={footerLinkClassName}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:flex-col sm:items-start sm:gap-2"
          >
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={footerLinkClassName}
              >
                {item.label}
              </Link>
            ))}
            <ConsentDialogLink className={footerLinkClassName}>
              Cookie settings
            </ConsentDialogLink>
          </nav>
        </div>
      </div>
    </footer>
  )
}
