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

const INITIAL_COUNT = Number.NaN

export function useScrollToNameSuggestionsOnReady(
  stage: NameSuggestionsStage,
  batchCount: number,
) {
  const previousCountRef = React.useRef(INITIAL_COUNT)

  React.useEffect(() => {
    const previousCount = previousCountRef.current
    previousCountRef.current = batchCount

    // Skip scroll on first effect run (existing batches already in view).
    if (Number.isNaN(previousCount)) {
      return
    }

    if (batchCount < 1) {
      return
    }

    const batchesJustReady = previousCount < 1
    const newGenerationArrived = batchCount > previousCount

    if (batchesJustReady || newGenerationArrived) {
      scrollToNameSuggestions(stage)
    }
  }, [batchCount, stage])
}
