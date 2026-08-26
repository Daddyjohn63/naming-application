"use client"

/**
 * Instagram 4:5 (1080×1350) naming card — same parchment language as
 * CeremonyCertificateDocument, without the personality profile or name
 * rationales. Off-screen capture only; not shown as an on-page preview.
 */

import type { Ref } from "react"
import { Crown, PawPrint, Shield, Sparkles } from "lucide-react"

import { SITE_WWW_HOST } from "@workspace/shared/constants/site"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

import type { CeremonyCertificateData } from "./ceremony-certificate-document"

export type CeremonyInstagramCardData = Pick<
  CeremonyCertificateData,
  "everydayName" | "catWorldName" | "ineffableName" | "photoSrc" | "dateLabel"
>

type CeremonyInstagramCardDocumentProps = {
  data: CeremonyInstagramCardData
  className?: string
  /** Capture node ref (React 19 ref-as-prop). */
  ref?: Ref<HTMLDivElement>
}

export function CeremonyInstagramCardDocument({
  data,
  className,
  ref,
}: CeremonyInstagramCardDocumentProps) {
  return (
    <div
      {...dataComponent("CeremonyInstagramCardDocument")}
      ref={ref}
      className={cn(
        "relative flex h-[1350px] w-[1080px] shrink-0 flex-col overflow-hidden rounded-[36px] border border-[#e7dcc4] bg-[#fdf9f0] px-12 pt-9 pb-7 text-[#4a3b2c]",
        className
      )}
    >
      <PawPrint
        aria-hidden
        className="absolute top-7 left-7 size-[26px] -rotate-12 text-[#e3d5b8]"
      />
      <PawPrint
        aria-hidden
        className="absolute top-7 right-7 size-[26px] rotate-12 text-[#e3d5b8]"
      />

      <header className="flex shrink-0 flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-3">
          <Sparkles aria-hidden className="size-4 text-[#c9a86a]" />
          <h1 className="font-serif text-[42px] leading-none font-semibold tracking-tight text-[#463628]">
            Completed Cat Profile
          </h1>
          <Sparkles aria-hidden className="size-4 text-[#c9a86a]" />
        </div>
        <div className="flex w-[180px] items-center gap-2.5 text-[#c9a86a]">
          <span className="h-px flex-1 bg-[#dcc9a3]" aria-hidden />
          <span aria-hidden className="text-sm leading-none">
            ♥
          </span>
          <span className="h-px flex-1 bg-[#dcc9a3]" aria-hidden />
        </div>
      </header>

      <div className="mt-[18px] flex min-h-0 flex-1 justify-center">
        {data.photoSrc !== undefined ? (
          <div className="aspect-4/5 h-full max-w-full rounded-[22px] border border-[#e7dcc4] bg-white p-2.5 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.photoSrc}
              alt={`Photo of ${data.everydayName}`}
              className="h-full w-full rounded-[14px] object-cover"
              crossOrigin="anonymous"
            />
          </div>
        ) : (
          <div className="flex aspect-4/5 h-full max-w-full flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-[#dcc9a3] bg-[#faf4e6] text-[#b09b72]">
            <PawPrint aria-hidden className="size-12" />
            <p className="text-base">No photo provided</p>
          </div>
        )}
      </div>

      <div className="mt-[18px] mb-3.5 flex shrink-0 items-center justify-center gap-3.5">
        <span className="h-px w-12 bg-[#dcc9a3]" aria-hidden />
        <h2 className="font-serif text-[28px] font-semibold whitespace-nowrap text-[#463628]">
          Your Cat&rsquo;s Three Names
        </h2>
        <span className="h-px w-12 bg-[#dcc9a3]" aria-hidden />
      </div>

      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#ecdfc2] bg-[#f9efdb] px-6 pt-4 pb-[18px] text-center">
          <Shield aria-hidden className="mb-1 size-7 text-[#b3893f]" />
          <p className="text-[26px] font-semibold leading-tight text-[#7a643f]">
            Family Name
          </p>
          <p className="font-serif text-[44px] leading-[1.12] font-bold wrap-break-word text-[#463628]">
            {data.everydayName}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#dbe5cf] bg-[#eef3e3] px-6 pt-4 pb-[18px] text-center">
          <Crown aria-hidden className="mb-1 size-7 text-[#6f8a4f]" />
          <p className="text-[26px] font-semibold leading-tight text-[#5f7245]">
            Cat-world Name
          </p>
          <p className="font-serif text-[44px] leading-[1.12] font-bold wrap-break-word text-[#3c4a2c]">
            {data.catWorldName}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#ddd4ea] bg-[#efeaf6] px-6 pt-4 pb-[18px] text-center">
          <Sparkles aria-hidden className="mb-1 size-7 text-[#8a6fb3]" />
          <p className="text-[26px] font-semibold leading-tight text-[#6f5c8f]">
            Ineffable Near-Name
          </p>
          <p className="font-serif text-[44px] leading-[1.12] font-bold wrap-break-word text-[#453460]">
            {data.ineffableName}
          </p>
        </div>
      </div>

      <footer className="mt-4 shrink-0 text-center">
        <p className="text-lg font-semibold tracking-wide text-[#8a7658]">
          {data.dateLabel}
        </p>
        <p className="mt-1 text-base tracking-wide text-[#a89474]">
          Created by {SITE_WWW_HOST}
        </p>
      </footer>
    </div>
  )
}
