import { Mail } from "lucide-react"

import { dataComponent } from "@/lib/data-component"

/** Placeholder support inbox until a real address is configured. */
export const USER_SUPPORT_EMAIL = "support@namingbuddy.example"

/** Contact block with dummy support email for the dashboard help page. */
export function UserSupportContact() {
  return (
    <section
      {...dataComponent("UserSupportContact")}
      aria-labelledby="support-contact-heading"
      className="max-w-3xl rounded-xl border border-border/70 bg-muted/20 p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background">
          <Mail className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <h2
            id="support-contact-heading"
            className="font-sans text-2xl font-semibold tracking-tight"
          >
            Contact support
          </h2>
          <p className="text-base leading-relaxed text-pretty text-muted-foreground">
            Still stuck, or something doesn’t look right? Email us and include
            your cat’s ceremony title if you can — that helps us find the right
            place quickly.
          </p>
          <p className="text-base">
            <a
              href={`mailto:${USER_SUPPORT_EMAIL}`}
              className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              {USER_SUPPORT_EMAIL}
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            We aim to reply within a couple of working days.
          </p>
        </div>
      </div>
    </section>
  )
}
