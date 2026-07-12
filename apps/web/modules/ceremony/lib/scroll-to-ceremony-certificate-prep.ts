/**
 * Scroll helpers for the main-column certificate prep card.
 */

export const CEREMONY_CERTIFICATE_PREP_SECTION_ID = "ceremony-certificate-prep"

const MAX_SCROLL_ATTEMPTS = 12

/** Smooth-scroll to the Create certificate card in the main column. */
export function scrollToCeremonyCertificatePrep() {
  const tryScroll = (attemptsLeft: number) => {
    const section = document.getElementById(CEREMONY_CERTIFICATE_PREP_SECTION_ID)
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
