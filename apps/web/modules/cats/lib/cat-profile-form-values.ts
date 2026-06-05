/**
 * KB-003 form values — convert draft description placeholder to empty string.
 * Maps Convex cat data to react-hook-form default values.
 */

import { DRAFT_CAT_DESCRIPTION_PLACEHOLDER } from "@workspace/shared/constants/cat-profile"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import type { SubmitCatProfileFieldsInput } from "@workspace/shared/schemas/cat"

export function catDescriptionForForm(description: string): string {
  return description === DRAFT_CAT_DESCRIPTION_PLACEHOLDER ? "" : description
}

export function defaultProfileFormValues(
  cat: Pick<
    Doc<"cats">,
    "title" | "description" | "existingName" | "age" | "breed"
  >
): SubmitCatProfileFieldsInput {
  return {
    title: cat.title,
    description: catDescriptionForForm(cat.description),
    existingName: cat.existingName ?? "",
    age: cat.age ?? "",
    breed: cat.breed ?? "",
  }
}
