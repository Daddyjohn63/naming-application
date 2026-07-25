import { CEREMONY_UNLOCK_AMOUNT_MINOR_USD } from "@workspace/shared/constants/naming-curation"

/**
 * Public beta — drives the Beta chrome badge and free unlock copy.
 * Flip to false when leaving beta / when charging begins.
 */
export const IS_PUBLIC_BETA = true

/** While true, ceremony unlock is free (tied to public beta for now). */
export const IS_BETA_UNLOCK_FREE = IS_PUBLIC_BETA

/** List price when paid unlock ships (e.g. "$3.99"). */
export const UNLOCK_LIST_PRICE_USD = `$${(CEREMONY_UNLOCK_AMOUNT_MINOR_USD / 100).toFixed(2)}`

/**
 * Price label shown in marketing and product UI.
 * During beta this is "Free"; later it becomes the list price.
 */
export const UNLOCK_PRICE_USD = IS_BETA_UNLOCK_FREE
  ? "Free"
  : UNLOCK_LIST_PRICE_USD

/** Short qualifier under the unlock price (pricing cards). */
export const UNLOCK_PRICE_QUALIFIER = IS_BETA_UNLOCK_FREE
  ? "during beta, per cat"
  : "one-time, per cat"
