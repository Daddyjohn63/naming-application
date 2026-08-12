import Link from "next/link"

import { Logo } from "@/components/logo"
import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { Button } from "@workspace/ui/components/button"

/**
 * Site-wide 404 — one full-viewport composition: brand, poetic miss, CTAs,
 * and the logo mark as the visual anchor (motif pattern behind).
 */
export function NotFoundView() {
  return (
    <main
      {...dataComponent("NotFoundView")}
      className="relative -mt-14 flex w-full flex-1 flex-col md:-mt-16"
    >
      <style>{`
        @keyframes not-found-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes not-found-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes not-found-soft-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.55; }
        }
        .not-found-float {
          animation: not-found-float 4.5s ease-in-out infinite;
        }
        .not-found-rise {
          animation: not-found-rise 0.7s ease-out both;
        }
        .not-found-rise-delay {
          animation: not-found-rise 0.7s ease-out 0.12s both;
        }
        .not-found-rise-delay-2 {
          animation: not-found-rise 0.7s ease-out 0.24s both;
        }
        .not-found-soft-glow {
          animation: not-found-soft-glow 5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .not-found-float,
          .not-found-rise,
          .not-found-rise-delay,
          .not-found-rise-delay-2,
          .not-found-soft-glow {
            animation: none;
          }
        }
      `}</style>

      <section className="relative flex min-h-svh w-full flex-1 flex-col items-center justify-center overflow-hidden border-b border-border/40 bg-[url('/images/hero-motif-pattern.png')] bg-cover bg-top bg-no-repeat px-4 pt-28 pb-16 md:pt-24 md:pb-20 dark:bg-[url('/images/hero-motif-pattern-dark.png')]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-background/20 to-background/80"
        />
        <div
          aria-hidden
          className="not-found-soft-glow pointer-events-none absolute top-1/3 left-1/2 size-[min(28rem,80vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl"
        />

        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <div className="not-found-float not-found-rise text-foreground">
            <Logo className="size-28 md:size-36" />
          </div>

          <div className="not-found-rise-delay flex flex-col items-center gap-4">
            <p
              aria-hidden
              className="font-serif text-7xl leading-none font-semibold tracking-tight text-foreground/12 md:text-8xl"
            >
              404
            </p>
            <h1 className="bg-linear-to-r from-primary via-chart-2 to-chart-3 bg-clip-text font-sans text-4xl leading-tight font-semibold tracking-tight text-transparent text-balance md:text-5xl lg:text-6xl">
              {APP_NAME}
            </h1>
            <p className="max-w-lg font-serif text-xl leading-relaxed text-balance italic text-foreground/90 md:text-2xl">
              This page has slipped out of sight
            </p>
            <p className="max-w-md text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
              Even cats with three names lose their way sometimes. The address
              may be mistyped, moved, or never existed.
            </p>
          </div>

          <nav
            aria-label="Page not found actions"
            className="not-found-rise-delay-2 mt-1 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button variant="default" size="lg" asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-up">Start a naming ceremony</Link>
            </Button>
          </nav>
        </div>
      </section>
    </main>
  )
}
