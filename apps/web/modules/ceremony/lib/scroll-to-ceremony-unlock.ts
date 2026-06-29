export const CEREMONY_UNLOCK_SECTION_ID = "ceremony-unlock"

const MAX_SCROLL_ATTEMPTS = 12

/** Smooth-scroll to the mobile unlock prompt below the three-name cards. */
export function scrollToCeremonyUnlock() {
  const tryScroll = (attemptsLeft: number) => {
    const section = document.getElementById(CEREMONY_UNLOCK_SECTION_ID)
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

/** Scroll to unlock on narrow viewports only (main-column prompt is lg:hidden). */
export function scrollToCeremonyUnlockOnMobile() {
  if (window.matchMedia("(min-width: 1024px)").matches) {
    return
  }
  scrollToCeremonyUnlock()
}
