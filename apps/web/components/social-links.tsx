import type { ReactElement } from "react"

import { SOCIAL_PROFILES, type SocialProfileId } from "@workspace/shared/constants/site"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

type SocialLinksProps = {
  /** Icon buttons, or labeled links for the mobile menu. */
  variant?: "icons" | "menu"
  className?: string
  onNavigate?: () => void
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-4", className)}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-4", className)}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

const SOCIAL_ICONS: Record<
  SocialProfileId,
  (props: { className?: string }) => ReactElement
> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
}

export function SocialLinks({
  variant = "icons",
  className,
  onNavigate,
}: SocialLinksProps) {
  return (
    <div
      {...dataComponent("SocialLinks")}
      className={cn(
        variant === "menu" ? "flex gap-2" : "flex items-center gap-1",
        className
      )}
    >
      {SOCIAL_PROFILES.map((profile) => {
        const Icon = SOCIAL_ICONS[profile.id]

        if (variant === "menu") {
          return (
            <Button
              key={profile.id}
              variant="outline"
              size="sm"
              className="min-w-0 flex-1"
              asChild
            >
              <a
                href={profile.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
              >
                <Icon />
                {profile.label}
              </a>
            </Button>
          )
        }

        return (
          <Button key={profile.id} variant="ghost" size="icon" asChild>
            <a
              href={profile.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={profile.label}
              onClick={onNavigate}
            >
              <Icon />
            </a>
          </Button>
        )
      })}
    </div>
  )
}
