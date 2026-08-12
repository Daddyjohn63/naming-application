import Link from "next/link"

import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { Button } from "@workspace/ui/components/button"

/** SEO hub hero — targets unique / unusual / literary cat-name intent. */
export function UniqueCatNamesHero() {
  return (
    <section
      {...dataComponent("UniqueCatNamesHero")}
      className="relative -mt-14 w-full border-b border-border/40 bg-[url('/images/hero-motif-pattern.png')] bg-cover bg-top bg-no-repeat md:-mt-16 dark:bg-[url('/images/hero-motif-pattern-dark.png')]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/70"
      />
      <div className="relative mx-auto flex min-h-[55svh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 pt-28 pb-16 text-center md:pt-24 md:pb-20">
        <p className="text-base/7 font-semibold">Unique cat names</p>
        <h1 className="font-sans text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
          Unique cat names shaped by who they are
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          Looking for unusual, elegant, or one-of-a-kind names? {APP_NAME}{" "}
          builds suggestions from your cat&apos;s photo and personality — then
          lets you claim a cat-world name no other cat can share.
        </p>
        <nav
          aria-label="Unique cat names actions"
          className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button variant="default" size="lg" asChild>
            <Link href="/sign-up">Find their names</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/cat-name-generator">See how the generator works</Link>
          </Button>
        </nav>
      </div>
    </section>
  )
}
