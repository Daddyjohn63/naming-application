"use client"

import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { api } from "@workspace/backend/_generated/api"

export function useCreateDraftCeremony() {
  const router = useRouter()
  const createDraftCat = useMutation(api.cats.createDraftCat)

  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  async function execute() {
    setError(null)
    setPending(true)
    try {
      const id = await createDraftCat()
      router.push(`/cats/${id}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create ceremony.",
      )
    } finally {
      setPending(false)
    }
  }

  return {
    execute,
    pending,
    error,
    clearError,
  }
}
