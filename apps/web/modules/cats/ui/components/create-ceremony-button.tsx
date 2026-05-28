"use client"

import * as React from "react"

import { PlusCircle } from "lucide-react"

import { ceremonyCtaButtonClassName } from "@/modules/ceremony/lib/ceremony-styles"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "@workspace/ui/components/sonner"

import { useCreateDraftCeremony } from "../hooks/use-create-draft-ceremony"

type CreateCeremonyButtonProps = Pick<
  React.ComponentProps<typeof Button>,
  "variant" | "size" | "className"
> & {
  /** Default copy for KB-002 primary CTA. */
  label?: string
}

export function CreateCeremonyButton({
  variant = "default",
  size = "default",
  className,
  label = "Add a cat",
}: CreateCeremonyButtonProps) {
  const { execute, pending, error, clearError } = useCreateDraftCeremony()

  React.useEffect(() => {
    if (error === null || error === "") {
      return
    }
    toast.error(error)
    clearError()
  }, [error, clearError])

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(ceremonyCtaButtonClassName, className)}
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        void execute()
      }}
    >
      <PlusCircle className="size-4" aria-hidden />
      {pending ? "Starting…" : label}
    </Button>
  )
}
