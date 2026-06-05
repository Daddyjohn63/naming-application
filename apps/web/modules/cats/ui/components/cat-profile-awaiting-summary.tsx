"use client"

import Image from "next/image"

import type { Doc } from "@workspace/backend/_generated/dataModel"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"

import { dataComponent } from "@/lib/data-component"

type CatProfileAwaitingSummaryProps = {
  cat: Doc<"cats"> & { photoUrl?: string }
}

function OptionalRow({ label, value }: { label: string; value?: string }) {
  if (value === undefined || value.trim() === "") {
    return null
  }
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
      <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
      <dd className="text-foreground text-sm">{value}</dd>
    </div>
  )
}

export function CatProfileAwaitingSummary({
  cat,
}: CatProfileAwaitingSummaryProps) {
  return (
    <div {...dataComponent("CatProfileAwaitingSummary")} className="flex flex-col gap-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center gap-3 border-0 pb-0">
          <Spinner className="text-primary size-5 shrink-0" />
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Generating your summary</CardTitle>
            <CardDescription>
              We&apos;re getting ready for the next step. You can leave and come
              back — your profile is saved.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Your cat&apos;s profile</CardTitle>
          <CardDescription>Submitted for summary generation.</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
          {cat.photoUrl !== undefined ? (
            <div className="bg-muted relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl border">
              <Image
                src={cat.photoUrl}
                alt="Your cat"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                unoptimized
              />
            </div>
          ) : null}
          <div>
            <h3 className="text-foreground mb-2 text-sm font-medium">Story</h3>
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {cat.description}
            </p>
          </div>
          <dl className="flex flex-col gap-3">
            <OptionalRow label="Current name" value={cat.existingName} />
            <OptionalRow label="Age" value={cat.age} />
            <OptionalRow label="Breed" value={cat.breed} />
          </dl>
        </div>
      </Card>
    </div>
  )
}
