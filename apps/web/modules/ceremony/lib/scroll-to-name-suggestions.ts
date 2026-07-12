/**
 * Scroll helpers for bringing name-suggestion curation into view once
 * generation completes (or a new generation arrives after regenerate).
 */

export type NameSuggestionsStage = "family" | "cat_world" | "ineffable"

const MAX_SCROLL_ATTEMPTS = 12

export function nameSuggestionsSectionId(
  stage: NameSuggestionsStage,
): string {
  return `name-suggestions-${stage}`
}

/** Smooth-scroll to the suggestions card for the given naming stage. */
export function scrollToNameSuggestions(stage: NameSuggestionsStage) {
  const sectionId = nameSuggestionsSectionId(stage)

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

  requestAnimationFrame(() => tryScroll(MAX_SCROLL_ATTEMPTS))
}
