/**
 * Scroll helpers for the main-column certificate prep card.
 */

import { scrollElementIntoView } from "@/modules/ceremony/lib/scroll-to-name-suggestions"

export const CEREMONY_CERTIFICATE_PREP_SECTION_ID = "ceremony-certificate-prep"

/** Smooth-scroll to the Create certificate card in the main column. */
export function scrollToCeremonyCertificatePrep() {
  scrollElementIntoView(CEREMONY_CERTIFICATE_PREP_SECTION_ID)
}
