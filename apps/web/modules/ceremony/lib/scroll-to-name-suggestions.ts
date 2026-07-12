/**
 * Scroll helpers for bringing name-suggestion curation into view once
 * generation completes (or a new generation arrives after regenerate).
 */

export type NameSuggestionsStage = "family" | "cat_world" | "ineffable"

const DEFAULT_MAX_SCROLL_ATTEMPTS = 12

/** Retry until the element exists, then smooth-scroll it into view. */
export function scrollElementIntoView(
  sectionId: string,
  maxAttempts: number = DEFAULT_MAX_SCROLL_ATTEMPTS,
) {
  const tryScroll = (attemptsLeft: number) => {
    const section = document.getElementById(sectionId)
    if (section !== null) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    if (attemptsLeft > 0) {
      requestAnimationFrame(() => tryScroll(attemptsLeft - 1))
    }
  }

  requestAnimationFrame(() => tryScroll(maxAttempts))
}

export function nameSuggestionsSectionId(
  stage: NameSuggestionsStage,
): string {
  return `name-suggestions-${stage}`
}

/** Smooth-scroll to the suggestions card for the given naming stage. */
export function scrollToNameSuggestions(stage: NameSuggestionsStage) {
  scrollElementIntoView(nameSuggestionsSectionId(stage))
}
