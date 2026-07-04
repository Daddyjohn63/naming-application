import { CEREMONY_UNLOCK_AMOUNT_MINOR_USD } from "@workspace/shared/constants/naming-curation"

/**
 * Formatted one-time unlock price for landing copy (e.g. "$3.99"), derived
 * from the shared minor-units amount so marketing copy can't drift from the
 * actual charge.
 */
export const UNLOCK_PRICE_USD = `$${(CEREMONY_UNLOCK_AMOUNT_MINOR_USD / 100).toFixed(2)}`
