/**
 * KB-004 AI prompts and Vercel AI SDK calls for photo validation and personality summary.
 * Prompt copy source of truth: ai-docs/prompts/FAMILY-SUMMARY-PROMPT.md (§0 + §1).
 */

import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"

import { classifyCatPhotoValidation } from "@workspace/shared/constants/cat-photo-validation"
import { catPhotoValidationSchema } from "@workspace/shared/schemas/cat-photo-validation"

/** Bump when prompt text changes — useful for logging and future funnel analytics. */
export const NAMING_PROMPT_VERSION = "family-summary-prompt-v1"

/** §0 system prompt: vision model returns scores only, never prose summary or names. */
const PHOTO_VALIDATION_SYSTEM_PROMPT = `You are Naming Buddy's photo validator for a cat naming ceremony.

Examine the uploaded image and return structured scores only — no summary, no name suggestions.

Evaluate:
1. Whether the primary subject is a cat (domestic cat or kitten). Reject obvious non-cats: dogs, people alone, landscapes, memes, cartoons, objects, empty rooms, etc. If multiple animals, the cat must be clearly primary.
2. catLikelihoodScore (1–10): how confident you are the image shows a cat as the main subject.
3. qualityScore (1–10): usefulness for a personality portrait — lighting, focus, resolution, how clearly the cat's face/body is visible (10 = excellent, 1 = unusable).

Be fair: a phone snapshot in average light can still score 6–7 if the cat is clearly visible. Score low for heavy blur, extreme darkness, cat as a tiny distant speck, or face completely hidden.

userMessage: one or two short plain sentences for the owner if blocked or warned (warm, not scolding). Empty string if silent pass.
blockReason: brief internal reason if not a cat or catLikelihoodScore would imply block; empty if pass/warn only.`

/** Short user turn paired with the image in the validation request. */
const PHOTO_VALIDATION_USER_TEXT =
  "Validate this uploaded photo for a cat naming ceremony."

/** §1 system prompt: Eliot-inspired personality portrait writer (no name suggestions). */
const SUMMARY_SYSTEM_PROMPT = `You are the Naming Buddy cat portrait writer — part poet, part observant friend.

Your job is to write a short personality summary of someone's cat for a playful naming ceremony inspired by T. S. Eliot's "The Naming of Cats."

Here is a summary of the poem,

T. S. Eliot's "The Naming of Cats" is a playful poem built around the idea that cats are mysterious, dignified creatures who need three different names.

The first name is the ordinary, everyday name humans use — something simple and practical, like the sort of name you might call across the room.

The second name is more unusual and personal. It gives the cat a sense of character, style, and individuality. This is the name that makes a cat feel grand, distinctive, and properly respected.

But the third name is the most important: it is the cat's secret name. No human can truly know it. This private name belongs only to the cat, and it explains why cats sometimes sit still, deep in thought, as if contemplating something profound.

The poem is really about the mystery and independence of cats. Eliot presents cats as creatures with inner lives that humans can admire but never fully understand. It is funny, elegant, and slightly magical — exactly the sort of poem that makes cat owners think, "Yes, that sounds about right."

Rules:
- Write 2–4 short paragraphs (roughly 120–220 words total).
- Tone: warm, witty, affectionate, specific — never generic filler ("fluffy companion", "lovely cat").
- Ground every claim in the owner's description and, when a photo is provided, in what you actually see (colour, markings, expression, posture, setting) — weave visible details naturally; do not list them like a catalog.
- Include at least one vivid habit or quirk and one line that hints at how the cat sees themselves.
- Use they/them unless the owner specifies otherwise.
- Plain prose only: no markdown, no bullet lists, no headings, no emojis.
- Do not invent medical facts, breed certifications, or dramatic backstory the owner did not imply.
- Do not suggest names — naming comes later.`

/** Profile fields passed into the summary prompt (subset of the cats row). */
export type CatProfileForSummary = {
  title: string
  description: string
  existingName?: string
  age?: string
  breed?: string
}

/** Build bullet lines for optional existingName / age / breed in the user prompt. */
function buildOptionalDetailsLines(profile: CatProfileForSummary): string[] {
  const lines: string[] = []
  if (
    profile.existingName !== undefined &&
    profile.existingName.trim() !== ""
  ) {
    lines.push(`- Existing name (if any): ${profile.existingName.trim()}`)
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
    ? "\n\nLook at the attached photo and combine what you see with the description above. Make note of the cat's colour, markings, expression, posture, and setting."
    : "\n\nNo photo was provided — rely on the description and optional details only."

  return `Write the personality summary for this cat.

Cat's title (how the owner refers to them): ${profile.title}

Owner's description:
${profile.description}${optionalBlock}${photoNote}`
}

/** Raw model scores plus code-derived block/warn/pass from shared thresholds. */
export type PhotoValidationResult = {
  validation: {
    isCat: boolean
    catLikelihoodScore: number
    qualityScore: number
    userMessage: string
    blockReason: string
  }
  outcome: ReturnType<typeof classifyCatPhotoValidation>
}

/** Call vision model; structured output validated by `catPhotoValidationSchema`. */
export async function validateCatPhotoWithAi(args: {
  imageUrl: string
}): Promise<PhotoValidationResult> {
  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: catPhotoValidationSchema }),
    messages: [
      { role: "system", content: PHOTO_VALIDATION_SYSTEM_PROMPT },
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
export async function generateCatSummaryWithAi(args: {
  profile: CatProfileForSummary
  imageUrl?: string
}): Promise<string> {
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

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  })

  return text.trim()
}

/** Map thrown SDK/network errors to a short user-facing retry message. */
export function normalizeAiError(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message.trim()
  }
  return "We couldn't complete that step. Please try again."
}
