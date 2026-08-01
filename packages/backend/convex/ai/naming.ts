/**
 * KB-004 AI prompts and Vercel AI SDK calls for photo validation and personality summary.
 * All model calls go through `generateWithFailover` (OpenAI primary, Gemini on outage).
 * Prompt copy source of truth: ai-docs/prompts/FAMILY-SUMMARY-PROMPT.md (§0 + §1).
 */

import { Output } from "ai"

import { APP_NAME } from "@workspace/shared/constants/app"
import type { ActionCtx } from "../_generated/server"
import { generateWithFailover } from "./generateWithFailover"
import {
  formatCatSexLabel,
  type CatSex,
} from "@workspace/shared/constants/cat-profile"
import { classifyCatPhotoValidation } from "@workspace/shared/constants/cat-photo-validation"
import { NAME_BATCH_SIZE } from "@workspace/shared/constants/naming-curation"
import { SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE } from "@workspace/shared/utils/summary-pipeline-error"
import {
  familyStyleLabelsForPrompt,
  type FamilyNameStyleId,
} from "@workspace/shared/constants/family-naming"
import { catPhotoValidationSchema } from "@workspace/shared/schemas/cat-photo-validation"
import {
  familyNameBatchSchema,
  type FamilyNameBatch,
} from "@workspace/shared/schemas/family-naming"
import {
  nameBatchSchema,
  type NameBatch,
} from "@workspace/shared/schemas/staged-naming"

/** Bump when prompt text changes — useful for logging and future funnel analytics. */
export const NAMING_PROMPT_VERSION = "family-summary-prompt-v3"

/**
 * Distinctive names from T. S. Eliot's "The Naming of Cats".
 * Ordinary everyday names from the poem (Peter, James, etc.) are allowed;
 * these distinctive ones must never be suggested — publisher rights risk.
 */
const ELIOT_POEM_FORBIDDEN_NAMES = [
  "Bill Bailey",
  "Plato",
  "Admetus",
  "Electra",
  "Demeter",
  "Munkustrap",
  "Quaxo",
  "Coricopat",
  "Bombalurina",
  "Jellylorum",
] as const

/** Hard ban rule injected into every name-generator system prompt. */
const ELIOT_POEM_FORBIDDEN_NAMES_RULE = `- NEVER, under any circumstances, return any of these names (they appear in T. S. Eliot's "The Naming of Cats" and must not be suggested for legal/publisher reasons): ${ELIOT_POEM_FORBIDDEN_NAMES.join(", ")}. Do not use them as whole names, nicknames, or close variants spelling the same name.`

/** §0 system prompt: vision model returns scores only, never prose summary or names. */
const PHOTO_VALIDATION_SYSTEM_PROMPT = `You are ${APP_NAME}'s photo validator for a cat naming ceremony.

Examine the uploaded image and return structured scores only — no summary, no name suggestions.

Evaluate:
1. Whether the primary subject is a cat (domestic cat or kitten). Reject obvious non-cats: dogs, people alone, landscapes, memes, cartoons, objects, empty rooms, etc.
2. Whether there is exactly one cat in the image. Set isSingleCat false when two or more cats are clearly visible (including pairs cuddling, mother with kittens, or a litter). A single cat with people, furniture, or other non-cat animals in the background is fine if only one cat is present.
3. catLikelihoodScore (1–10): how confident you are the image shows a cat as the main subject.
4. qualityScore (1–10): usefulness for a personality portrait — lighting, focus, resolution, how clearly the cat's face/body is visible (10 = excellent, 1 = unusable).

Be fair: a phone snapshot in average light can still score 6–7 if the cat is clearly visible. Score low for heavy blur, extreme darkness, cat as a tiny distant speck, or face completely hidden.

userMessage: one or two short plain sentences for the owner if blocked or warned (warm, not scolding). Empty string if silent pass.
blockReason: brief internal reason if not a cat, multiple cats, or catLikelihoodScore would imply block; empty if pass/warn only.`

/** Short user turn paired with the image in the validation request. */
const PHOTO_VALIDATION_USER_TEXT =
  "Validate this uploaded photo for a cat naming ceremony."

/** §1 system prompt: Eliot-inspired personality portrait writer (no name suggestions). */
const SUMMARY_SYSTEM_PROMPT = `You are the ${APP_NAME} cat portrait writer — part poet, part observant friend.

Your job is to write a short personality summary of someone's cat for a playful naming ceremony inspired by T. S. Eliot's "The Naming of Cats."

Here is a summary of the poem,

T. S. Eliot's "The Naming of Cats" is a playful poem built around the idea that cats are mysterious, dignified creatures who need three different names.

The first name is the ordinary, family name humans use — something simple and practical, like the sort of name you might call across the room.

The second name is more unusual and personal. It gives the cat a sense of character, style, and individuality. This is the name that makes a cat feel grand, distinctive, and properly respected.

But the third name is the most important: it is the cat's secret name. No human can truly know it. This private name belongs only to the cat, and it explains why cats sometimes sit still, deep in thought, as if contemplating something profound.

The poem is really about the mystery and independence of cats. Eliot presents cats as creatures with inner lives that humans can admire but never fully understand. It is funny, elegant, and slightly magical — exactly the sort of poem that makes cat owners think, "Yes, that sounds about right."

Rules:
- Write 2–4 short paragraphs (roughly 120–220 words total).
- Tone: warm, witty, affectionate, specific — never generic filler ("fluffy companion", "lovely cat").
- A photo is always attached. Treat visible physical details as authoritative from the photo: colour, markings, eye colour, expression, posture, and setting. Use the owner's description for personality, behaviour, habits, quirks, and temperament.
- If the description conflicts with the photo on something visible, follow the photo for appearance and the description for character. Do not invent physical traits the photo contradicts. Treat figurative language in the description (e.g. "eyes like embers") as personality colour, not literal appearance.
- Weave appearance details naturally; do not list them like a catalog.
- Include at least one vivid habit or quirk and one line that hints at how the cat sees themselves.
- Use he/him or she/her when sex is provided in optional details; otherwise use they/them.
- Plain prose only: no markdown, no bullet lists, no headings, no emojis.
- Do not invent medical facts, breed certifications, or dramatic backstory the owner did not imply.
- Do not suggest names — naming comes later.`

/** Profile fields passed into the summary prompt (subset of the cats row). */
export type CatProfileForSummary = {
  title: string
  description: string
  existingName?: string
  sex?: CatSex
  age?: string
  breed?: string
}

/** Build bullet lines for optional profile details in the user prompt. */
function buildOptionalDetailsLines(profile: CatProfileForSummary): string[] {
  const lines: string[] = []
  if (
    profile.existingName !== undefined &&
    profile.existingName.trim() !== ""
  ) {
    lines.push(`- Existing name (if any): ${profile.existingName.trim()}`)
  }
  const sexLabel = formatCatSexLabel(profile.sex)
  if (sexLabel !== undefined) {
    lines.push(`- Sex: ${sexLabel}`)
  }
  if (profile.age !== undefined && profile.age.trim() !== "") {
    lines.push(`- Age: ${profile.age.trim()}`)
  }
  if (profile.breed !== undefined && profile.breed.trim() !== "") {
    lines.push(`- Breed (if known): ${profile.breed.trim()}`)
  }
  return lines
}

/** Assemble the full user message for summary generation (text ± multimodal note). */
function buildSummaryUserText(
  profile: CatProfileForSummary,
  hasPhoto: boolean
): string {
  const optionalLines = buildOptionalDetailsLines(profile)
  const optionalBlock =
    optionalLines.length > 0
      ? `\n\nOptional details:\n${optionalLines.join("\n")}`
      : ""

  const photoNote = hasPhoto
    ? "\n\nA photo is attached. Use it as the source of truth for visible appearance (colour, markings, eye colour, expression, posture, setting) — if the description conflicts, follow the photo for looks and the description for personality. Use the description above for character, habits, and quirks."
    : "\n\nNo photo was attached (unexpected). Rely on the description and optional details for both appearance and personality."

  return `Write the personality summary for this cat.

Cat's title (how the owner refers to them): ${profile.title}

Owner's description:
${profile.description}${optionalBlock}${photoNote}`
}

/** Raw model scores plus code-derived block/warn/pass from shared thresholds. */
export type PhotoValidationResult = {
  validation: {
    isCat: boolean
    isSingleCat: boolean
    catLikelihoodScore: number
    qualityScore: number
    userMessage: string
    blockReason: string
  }
  outcome: ReturnType<typeof classifyCatPhotoValidation>
}

/** Call vision model; structured output validated by `catPhotoValidationSchema`. */
export async function validateCatPhotoWithAi(
  ctx: ActionCtx,
  args: {
    imageUrl: string
  }
): Promise<PhotoValidationResult> {
  const { output } = await generateWithFailover(ctx, {
    system: PHOTO_VALIDATION_SYSTEM_PROMPT,
    output: Output.object({ schema: catPhotoValidationSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PHOTO_VALIDATION_USER_TEXT },
          { type: "image", image: args.imageUrl },
        ],
      },
    ],
  })

  return {
    validation: output,
    outcome: classifyCatPhotoValidation(output),
  }
}

/** Generate 120–220 word personality summary; attaches photo URL when provided. */
export async function generateCatSummaryWithAi(
  ctx: ActionCtx,
  args: {
    profile: CatProfileForSummary
    imageUrl?: string
  }
): Promise<string> {
  const hasPhoto = args.imageUrl !== undefined && args.imageUrl.length > 0
  const userText = buildSummaryUserText(args.profile, hasPhoto)

  const userContent: Array<
    { type: "text"; text: string } | { type: "image"; image: string }
  > = hasPhoto
    ? [
        { type: "text", text: userText },
        { type: "image", image: args.imageUrl! },
      ]
    : [{ type: "text", text: userText }]

  const { text } = await generateWithFailover(ctx, {
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  })

  return text.trim()
}

/** §2 system prompt: everyday family names grounded in the cat summary. */
const FAMILY_NAMES_SYSTEM_PROMPT = `You are ${APP_NAME}'s family-name generator for the "family name" a cat's humans use daily (T. S. Eliot's first name).

Rules:
- Return exactly 10 name options.
- Each name must be a plausible everyday family name (first name or familiar nickname) — sensible, speakable, not joke strings or random syllables unless the style is Silly.
- Match the requested style throughout the set.
- Ground choices in the cat summary — names should feel earned by personality and appearance, not random.
- Each option needs a one-sentence rationale (max ~25 words) explaining the fit.
- No duplicate names within the batch.
- Avoid names already in the excluded list.
${ELIOT_POEM_FORBIDDEN_NAMES_RULE}
- Respond with valid JSON only — no markdown, no preamble.`

const FAMILY_STYLE_PROMPT_NUANCES: Record<FamilyNameStyleId, string> = {
  elegant: "Refined, graceful, slightly literary; avoid cutesy spellings.",
  silly: "Warm humour, gentle absurdity; still usable day-to-day.",
  classic: "Timeless human names; could appear on a birth certificate.",
  nature_inspired: "Flora, fauna, seasons, landscapes — subtle not cartoon.",
  non_human_names:
    "Names that feel otherworldly or non-human yet still speakable as everyday family nicknames.",
}

function buildFamilyStylePromptLine(
  styleIds: readonly FamilyNameStyleId[]
): string {
  const labels = familyStyleLabelsForPrompt(styleIds)
  const nuances = styleIds.map((id) => FAMILY_STYLE_PROMPT_NUANCES[id])
  return `Family name style: ${labels.join(" + ")}\n${nuances.join("\n")}`
}

function buildFamilyNamesUserText(args: {
  summaryText: string
  styleIds: readonly FamilyNameStyleId[]
  excludedNames: readonly string[]
  generationIndex: number
}): string {
  const excluded =
    args.excludedNames.length > 0 ? args.excludedNames.join(", ") : "(none)"

  return `Cat personality summary:
${args.summaryText}

${buildFamilyStylePromptLine(args.styleIds)}

Generation batch: ${args.generationIndex} (0 = first batch, 1 = regeneration — must differ meaningfully from batch 0)

Excluded names (do not reuse): ${excluded}

Generate 10 family name options with rationales.`
}

/** Generate a batch of 10 family names + rationales (KB-006 §2). */
export async function generateFamilyNamesWithAi(
  ctx: ActionCtx,
  args: {
    summaryText: string
    styleIds: readonly FamilyNameStyleId[]
    excludedNames: readonly string[]
    generationIndex: number
  }
): Promise<FamilyNameBatch> {
  const userText = buildFamilyNamesUserText(args)

  const { output } = await generateWithFailover(ctx, {
    system: FAMILY_NAMES_SYSTEM_PROMPT,
    output: Output.object({ schema: familyNameBatchSchema }),
    messages: [{ role: "user", content: userText }],
  })

  return output
}

/** §2.8 — cat-world names (second ceremony name); structured JSON via nameBatchSchema. */
const CAT_WORLD_NAMES_SYSTEM_PROMPT = `You are ${APP_NAME}'s cat-world name generator — the grand, distinctive second name a cat carries among other cats (T. S. Eliot's "cat-world name").

Rules:
- Return exactly ${NAME_BATCH_SIZE} name options.
- Each name should feel literary, dignified, slightly mysterious, or theatrically cat-like — a name other cats might use in their secret society.
- Ground choices in the cat's personality summary and their chosen everyday (family) name.
- Each option needs a one-sentence rationale (max ~25 words) explaining the fit.
- No duplicate names within the batch.
- Avoid names already in the excluded list.
${ELIOT_POEM_FORBIDDEN_NAMES_RULE}
- Names must be speakable and memorable — not random syllable strings.
- Respond with valid JSON only — no markdown, no preamble.`

/** §2.9 — ineffable near-names (third ceremony name); no global uniqueness. */
const INEFFABLE_NAMES_SYSTEM_PROMPT = `You are ${APP_NAME}'s ineffable near-name generator — playful approximations of a cat's unknowable secret name (T. S. Eliot's third name that no human can truly know).

Rules:
- Return exactly ${NAME_BATCH_SIZE} near-name options.
- Tone: whimsical, poetic, slightly absurd, mysterious — like a human guessing at something cats keep private.
- Names can be neologisms, compound phrases, or almost-words that feel "close" to a secret identity without claiming to be the real thing.
- Ground choices in the cat summary, family name, and cat-world name already chosen.
- Each option needs a short poetic rationale (max ~25 words).
- No duplicate names within the batch.
- Avoid names already in the excluded list.
${ELIOT_POEM_FORBIDDEN_NAMES_RULE}
- Respond with valid JSON only — no markdown, no preamble.`

function buildCatWorldNamesUserText(args: {
  summaryText: string
  everydayName: string
  excludedNames: readonly string[]
  generationIndex: number
}): string {
  const excluded =
    args.excludedNames.length > 0 ? args.excludedNames.join(", ") : "(none)"

  return `Cat personality summary:
${args.summaryText}

Everyday (family) name already chosen: ${args.everydayName}

Generation batch: ${args.generationIndex} (0 = first batch, 1 = regeneration — must differ meaningfully from batch 0)

Excluded names (do not reuse): ${excluded}

Generate 10 cat-world name options with rationales.`
}

function buildIneffableNamesUserText(args: {
  summaryText: string
  everydayName: string
  catWorldName: string
  excludedNames: readonly string[]
  generationIndex: number
}): string {
  const excluded =
    args.excludedNames.length > 0 ? args.excludedNames.join(", ") : "(none)"

  return `Cat personality summary:
${args.summaryText}

Everyday name: ${args.everydayName}
Cat-world name: ${args.catWorldName}

Generation batch: ${args.generationIndex} (0 = first batch, 1 = regeneration)

Excluded names (do not reuse): ${excluded}

Generate 10 ineffable near-name options with short poetic rationales.`
}

/** Generate a batch of 10 cat-world names + rationales (KB-009). Uses `system:` option per AI SDK guidance. */
export async function generateCatWorldNamesWithAi(
  ctx: ActionCtx,
  args: {
    summaryText: string
    everydayName: string
    excludedNames: readonly string[]
    generationIndex: number
  }
): Promise<NameBatch> {
  const userText = buildCatWorldNamesUserText(args)

  const { output } = await generateWithFailover(ctx, {
    system: CAT_WORLD_NAMES_SYSTEM_PROMPT,
    output: Output.object({ schema: nameBatchSchema }),
    messages: [{ role: "user", content: userText }],
  })

  return output
}

/** Generate a batch of 10 ineffable near-names + rationales (KB-010). Uses `system:` option per AI SDK guidance. */
export async function generateIneffableNamesWithAi(
  ctx: ActionCtx,
  args: {
    summaryText: string
    everydayName: string
    catWorldName: string
    excludedNames: readonly string[]
    generationIndex: number
  }
): Promise<NameBatch> {
  const userText = buildIneffableNamesUserText(args)

  const { output } = await generateWithFailover(ctx, {
    system: INEFFABLE_NAMES_SYSTEM_PROMPT,
    output: Output.object({ schema: nameBatchSchema }),
    messages: [{ role: "user", content: userText }],
  })

  return output
}

const AI_ERROR_USER_MESSAGE = SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE

/** Map thrown SDK/network errors to a short user-facing retry message. */
export function normalizeAiError(error: unknown): string {
  if (error instanceof Error) {
    console.error(
      "AI step failed:",
      error.message.trim() || "(no message)",
      error
    )
  } else {
    console.error("AI step failed:", error)
  }
  return AI_ERROR_USER_MESSAGE
}
