"use client"

/**
 * KB-011 — the certificate itself (HTML reproduction of the reference design in
 * `apps/web/public/images/certifcate.png`, with "Portrait" → "Profile" copy).
 *
 * Colours are hardcoded parchment hexes (not theme tokens) so the certificate
 * looks identical in light/dark mode and in the captured PDF. Rendered twice by
 * the view: a responsive on-screen preview and a fixed-width capture instance.
 */

import { Crown, Feather, PawPrint, Shield, Sparkles } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

export type CeremonyCertificateData = {
  everydayName: string
  catWorldName: string
  ineffableName: string
  /** Short AI rationale for the family / everyday name. */
  everydayNameRationale: string | undefined
  /** Short AI rationale for the cat-world name. */
  catWorldNameRationale: string | undefined
  /** Short AI rationale for the ineffable near-name. */
  ineffableNameRationale: string | undefined
  /** Accepted AI summary — "The Cat Profile" section. */
  summaryText: string | undefined
  /** Photo as data URL (capture-safe) or https URL; omitted when no photo. */
  photoSrc: string | undefined
  /** e.g. "Named on 5 July 2026". */
  dateLabel: string
}

type CeremonyCertificateDocumentProps = {
  data: CeremonyCertificateData
  /** Fixed 800px layout for PDF capture; otherwise responsive preview. */
  fixed?: boolean
  className?: string
  /** Capture node ref (React 19 ref-as-prop). */
  ref?: React.Ref<HTMLDivElement>
}

function summaryParagraphs(summaryText: string | undefined): string[] {
  if (summaryText === undefined) {
    return []
  }
  return summaryText
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
}

export function CeremonyCertificateDocument({
  data,
  fixed = false,
  className,
  ref,
}: CeremonyCertificateDocumentProps) {
  const paragraphs = summaryParagraphs(data.summaryText)

  return (
    <div
      {...dataComponent("CeremonyCertificateDocument")}
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#e7dcc4] bg-[#fdf9f0] px-6 py-8 text-[#4a3b2c] shadow-sm sm:px-10",
        fixed ? "w-[800px] shrink-0" : "w-full",
        className
      )}
    >
      {/* Corner accents */}
      <PawPrint
        aria-hidden
        className="absolute top-6 left-5 size-6 -rotate-12 text-[#e3d5b8]"
      />
      <PawPrint
        aria-hidden
        className="absolute top-6 right-5 size-6 rotate-12 text-[#e3d5b8]"
      />

      {/* Header */}
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-3">
          <Sparkles aria-hidden className="size-4 text-[#c9a86a]" />
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#463628] sm:text-4xl">
            Completed Cat Profile
          </h1>
          <Sparkles aria-hidden className="size-4 text-[#c9a86a]" />
        </div>
        <div className="flex w-48 items-center gap-2 text-[#c9a86a]">
          <span className="h-px flex-1 bg-[#dcc9a3]" aria-hidden />
          <span aria-hidden className="text-sm leading-none">
            ♥
          </span>
          <span className="h-px flex-1 bg-[#dcc9a3]" aria-hidden />
        </div>
      </header>

      {/* Photo — centered */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {data.photoSrc !== undefined ? (
          <div className="w-full max-w-[300px] rounded-xl border border-[#e7dcc4] bg-white p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.photoSrc}
              alt={`Photo of ${data.everydayName}`}
              className="aspect-4/5 w-full rounded-lg object-cover"
              crossOrigin="anonymous"
            />
          </div>
        ) : (
          <div className="flex aspect-4/5 w-full max-w-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#dcc9a3] bg-[#faf4e6] text-[#b09b72]">
            <PawPrint aria-hidden className="size-10" />
            <p className="text-sm">No photo provided</p>
          </div>
        )}

        <div className="text-center">
          <p className="font-serif text-3xl font-semibold wrap-break-word text-[#9a6b32]">
            {data.everydayName}
          </p>
          <div aria-hidden className="mx-auto mt-2 h-px w-24 bg-[#dcc9a3]" />
        </div>
      </div>

      {/* The cat profile (accepted summary) — full width */}
      <div className="mt-6 rounded-xl border border-[#efe5cf] bg-[#fbf6ea] px-5 py-5 sm:px-8">
        <div className="flex items-center justify-center gap-2">
          <Feather aria-hidden className="size-5 text-[#c9a86a]" />
          <h2 className="font-serif text-xl font-semibold text-[#463628]">
            Your Cat&apos;s Profile
          </h2>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-[#5d4c38]">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-center text-sm leading-relaxed text-[#8a7658] italic">
              A cat of quiet mystery — their profile speaks through their three
              names below.
            </p>
          )}
        </div>
      </div>

      {/* Three names */}
      <div className="mt-6 rounded-xl border border-[#efe5cf] bg-[#fbf6ea] px-4 py-5">
        <div className="flex items-center justify-center gap-2">
          <span className="h-px w-10 bg-[#dcc9a3]" aria-hidden />
          <h2 className="font-serif text-lg font-semibold text-[#463628]">
            Your Cat&rsquo;s Three Names
          </h2>
          <span className="h-px w-10 bg-[#dcc9a3]" aria-hidden />
        </div>
        <div
          className={cn(
            "mt-3 grid gap-3",
            fixed ? "grid-cols-3" : "sm:grid-cols-3"
          )}
        >
          <div className="flex items-start gap-3 rounded-lg border border-[#ecdfc2] bg-[#f9efdb] px-4 py-6">
            <Shield
              aria-hidden
              className="mt-0.5 size-5 shrink-0 text-[#b3893f]"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#7a643f]">Family Name:</p>
              <p className="font-serif text-sm font-semibold wrap-break-word text-[#463628]">
                &ldquo;{data.everydayName}&rdquo;
              </p>
              {data.everydayNameRationale !== undefined &&
              data.everydayNameRationale.length > 0 ? (
                <p className="mt-1.5 text-xs leading-relaxed wrap-break-word text-[#7a643f]">
                  {data.everydayNameRationale}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-[#dbe5cf] bg-[#eef3e3] px-4 py-6">
            <Crown
              aria-hidden
              className="mt-0.5 size-5 shrink-0 text-[#6f8a4f]"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#5f7245]">
                Cat-world Name:
              </p>
              <p className="font-serif text-sm font-semibold wrap-break-word text-[#3c4a2c]">
                &ldquo;{data.catWorldName}&rdquo;
              </p>
              {data.catWorldNameRationale !== undefined &&
              data.catWorldNameRationale.length > 0 ? (
                <p className="mt-1.5 text-xs leading-relaxed wrap-break-word text-[#5f7245]">
                  {data.catWorldNameRationale}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-[#ddd4ea] bg-[#efeaf6] px-4 py-6">
            <Sparkles
              aria-hidden
              className="mt-0.5 size-5 shrink-0 text-[#8a6fb3]"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#6f5c8f]">
                Ineffable Near-Name:
              </p>
              <p className="font-serif text-sm font-semibold wrap-break-word text-[#453460]">
                &ldquo;{data.ineffableName}&rdquo;
              </p>
              {data.ineffableNameRationale !== undefined &&
              data.ineffableNameRationale.length > 0 ? (
                <p className="mt-1.5 text-xs leading-relaxed wrap-break-word text-[#6f5c8f]">
                  {data.ineffableNameRationale}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Date */}
      <p className="mt-5 text-center text-xs font-medium tracking-wide text-[#8a7658]">
        {data.dateLabel}
      </p>
    </div>
  )
}
