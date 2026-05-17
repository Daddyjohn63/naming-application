"use client"

import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { api } from "@workspace/backend/_generated/api"

export function useCreateDraftCeremony() {
  const router = useRouter()
  const createDraftCat = useMutation(api.cats.createDraftCat)

  const isExecutingRef = React.useRef(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  async function execute() {
    if (isExecutingRef.current) {
      return
    }
    isExecutingRef.current = true
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
      isExecutingRef.current = false
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
