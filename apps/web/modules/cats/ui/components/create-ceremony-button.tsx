"use client"

import * as React from "react"

import { PlusCircle } from "lucide-react"

import { ceremonyCtaButtonClassName } from "@/modules/ceremony/lib/ceremony-styles"
import { dataComponent } from "@/lib/data-component"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "@workspace/ui/components/sonner"

import { useCatCeremonyEntitlement } from "../hooks/use-cat-ceremony-entitlement"
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
  const { canCreate, quotaMessage } = useCatCeremonyEntitlement()
  const { execute, pending, error, clearError } = useCreateDraftCeremony({
    enabled: canCreate,
  })

  React.useEffect(() => {
    if (error === null || error === "") {
      return
    }
    toast.error(error)
    clearError()
  }, [error, clearError])

  const disabled = pending || !canCreate

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        {...dataComponent("CreateCeremonyButton")}
        type="button"
        variant={variant}
        size={size}
        className={cn(ceremonyCtaButtonClassName, className)}
        disabled={disabled}
        aria-busy={pending}
        title={
          !canCreate && quotaMessage !== null ? quotaMessage : undefined
        }
        onClick={() => {
          void execute()
        }}
      >
        <PlusCircle className="size-4" aria-hidden />
        {pending ? "Starting…" : label}
      </Button>
      {quotaMessage !== null ? (
        <p className="max-w-sm text-center text-sm text-pretty text-muted-foreground">
          {quotaMessage}
        </p>
      ) : null}
    </div>
  )
}
