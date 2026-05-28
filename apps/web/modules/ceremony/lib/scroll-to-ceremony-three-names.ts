export const CEREMONY_THREE_NAMES_SECTION_ID = "ceremony-three-names"

const MAX_SCROLL_ATTEMPTS = 12

/** Smooth-scroll to the three-name cards after the user picks a family favourite. */
export function scrollToCeremonyThreeNames() {
  const tryScroll = (attemptsLeft: number) => {
    const section = document.getElementById(CEREMONY_THREE_NAMES_SECTION_ID)
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
