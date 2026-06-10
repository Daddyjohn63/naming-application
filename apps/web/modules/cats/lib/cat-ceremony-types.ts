/**
 * Shared TypeScript types for the cat ceremony page and its subcomponents.
 *
 * Centralizes the Convex query return type so views, hooks, and lib helpers
 * stay in sync without importing from generated API in every file.
 */

import type { api } from "@workspace/backend/_generated/api"
import type { FunctionReturnType } from "convex/server"

/** Cat document returned by `getCatByIdForOwner` when found and owned by the user. */
export type CatCeremonyDoc = NonNullable<
  FunctionReturnType<typeof api.cats.getCatByIdForOwner>
>
