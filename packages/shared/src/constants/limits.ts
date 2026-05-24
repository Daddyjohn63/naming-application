/** String length bounds shared by Zod schemas and UI copy. */
// TODO: these are not used anywhere. Delete them..
export const MAX_POST_TITLE_LENGTH = 300
export const MAX_POST_SLUG_LENGTH = 320
export const MAX_POST_NAME_LENGTH = 300
export const MAX_POST_CAT_DESCRIPTION_LENGTH = 4000
export const MAX_POST_CONTEXT_LENGTH = 8000

/** Convex `cats` create / dashboard / profile forms (friendly label, story). */
export const MAX_CAT_TITLE_LENGTH = 150
export const MAX_CAT_SLUG_LENGTH = MAX_POST_SLUG_LENGTH
export const MAX_CAT_DESCRIPTION_LENGTH = 1000
export const MIN_CAT_DESCRIPTION_LENGTH = 20

/** Optional profile basics on KB-003 (`existingName`, `age`, `breed`). */
export const MAX_CAT_OPTIONAL_FIELD_LENGTH = 150
