"use client"

/**
 * Scrolls the stage's name-suggestions card into view when batches first
 * appear or when a new generation is added after regenerate.
 */

import * as React from "react"

import {
  scrollToNameSuggestions,
  type NameSuggestionsStage,
} from "@/modules/ceremony/lib/scroll-to-name-suggestions"

export function useScrollToNameSuggestionsOnReady(
  stage: NameSuggestionsStage,
  batchCount: number,
) {
  const previousCountRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (batchCount < 1) {
      previousCountRef.current = batchCount
      return
    }

    const previousCount = previousCountRef.current
    previousCountRef.current = batchCount

    const batchesJustReady =
      previousCount === null || previousCount < 1
    const newGenerationArrived =
      previousCount !== null && batchCount > previousCount

    if (batchesJustReady || newGenerationArrived) {
      scrollToNameSuggestions(stage)
    }
  }, [batchCount, stage])
}
