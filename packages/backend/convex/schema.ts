import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

/** Lifecycle position in the guided naming ceremony (Phase 1 funnel). */
const ceremonyStep = v.union(
  v.literal("draft"),
  /** Photo + description saved; portrait job may run or be queued. */
  v.literal("awaiting_portrait"),
  /** Portrait exists; user may edit, accept, or regenerate (within limits). */
  v.literal("portrait_review"),
  /** Portrait locked; user must complete one-off unlock before name stages. */
  v.literal("awaiting_payment"),
  /** Stage 7–8 in MYAPPOBJECTIVES: ten family-name options per generation. */
  v.literal("naming_family"),
  /** Literary / distinct identity names; uniqueness enforced via claims table. */
  v.literal("naming_cat_world"),
  /** “Ineffable near-name” approximations (mysterious secret-name vibe). */
  v.literal("naming_ineffable"),
  /** Step 10: fun illustrative image using portrait + chosen names. */
  v.literal("awaiting_character_image"),
  /** Certificate generated; share/download available. */
  v.literal("ceremony_complete")
)

const nameStage = v.union(
  v.literal("family"),
  v.literal("cat_world"),
  v.literal("ineffable")
)

const paymentStatus = v.union(
  v.literal("pending"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("refunded")
)

export default defineSchema({
  /**
   * App user mirrored from Clerk (webhook upsert). Owns cats and payments.
   * Separate from Clerk so Convex queries join on stable Id<"users">.
   */
  users: defineTable({
    clerkUserId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  /**
   * One row per cat profile / naming ceremony (Phase 1 “one or more cat profiles”).
   * Holds funnel step, regeneration budgets, pointers to assets, and final choices.
   * Original upload stays in photoStorageId; accepted portrait text/image live on
   * cat_portrait_versions with optional acceptedPortraitVersionId here.
   */
  cats: defineTable({
    userId: v.id("users"),
    /** Friendly label in lists (“Whiskers”, “New kitten”). */
    title: v.string(),
    /** Optional URL slug once you expose shareable certificate/profile routes. */
    slug: v.optional(v.string()),
    /** Owner-written personality / story (AI naming input). */
    description: v.string(),
    /** Uploaded cat photo reference (Convex file storage). */
    photoStorageId: v.optional(v.id("_storage")),
    ceremonyStep,
    /** AI portrait regenerations already consumed (cap at 1 for cost control per objectives). */
    portraitRegenerationsUsed: v.number(),
    /** Accepted portrait row; naming stages should read portrait copy from this version. */
    acceptedPortraitVersionId: v.optional(v.id("cat_portrait_versions")),
    /** Successful unlock tied to this ceremony (see cat_payments). */
    ceremonyPaymentId: v.optional(v.id("cat_payments")),
    /** Final picks + rationales copied here for certificate & fast dashboard reads. */
    selectedFamilyName: v.optional(v.string()),
    selectedFamilyRationale: v.optional(v.string()),
    selectedCatWorldName: v.optional(v.string()),
    selectedCatWorldRationale: v.optional(v.string()),
    selectedIneffableName: v.optional(v.string()),
    selectedIneffableRationale: v.optional(v.string()),
    /** Step 10 output: whimsical character image incorporating names + portrait. */
    characterImageStorageId: v.optional(v.id("_storage")),
    /** Rendered certificate asset (PDF/PNG) after ceremony completes. */
    certificateStorageId: v.optional(v.id("_storage")),
    ceremonyCompletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_userId_slug", ["userId", "slug"]),

  /**
   * Version history for the editable AI personality / heritage portrait.
   * Each AI run or meaningful user edit inserts a row; acceptance sets
   * cats.acceptedPortraitVersionId (and optionally locks the step forward).
   */
  cat_portrait_versions: defineTable({
    catId: v.id("cats"),
    /** Narrative portrait copy the user can edit (markdown or plain — app decides). */
    portraitText: v.string(),
    /** Optional rendered portrait image from vision/text pipeline. */
    portraitImageStorageId: v.optional(v.id("_storage")),
    /** Monotonic per cat for ordering history. */
    versionNumber: v.number(),
    source: v.union(v.literal("ai"), v.literal("user_edit")),
    createdAt: v.number(),
  }).index("by_catId_versionNumber", ["catId", "versionNumber"]),

  /**
   * Each AI batch of ~10 names + short rationales for one naming stage.
   * Regeneration creates a new row (higher generationIndex). Style chips from the UI
   * (“funnier”, “more mystical”) live in styleHints for prompt replay / analytics.
   */
  cat_name_generations: defineTable({
    catId: v.id("cats"),
    /** The naming stage that the generation is for. family | cat_world | ineffable */
    stage: nameStage,
    /** 0-based: increments on “generate again” for that stage. */
    generationIndex: v.number(),
    styleHints: v.optional(v.array(v.string())),
    names: v.array(
      v.object({
        name: v.string(),
        rationale: v.string(),
      })
    ),
    createdAt: v.number(),
  }).index("by_catId_stage_generationIndex", [
    "catId",
    "stage",
    "generationIndex",
  ]),

  /**
   * Reserved cat-world names per user so Stage 8 can exclude already-used strings.
   * When the user commits a cat-world choice, upsert by (userId, normalizedName).
   * normalizedName should be lowercase/trimmed ASCII fold for comparisons.
   */
  cat_world_name_claims: defineTable({
    userId: v.id("users"),
    normalizedName: v.string(),
    catId: v.id("cats"),
    /** Optional link to the generation row the label was picked from (audit). */
    sourceGenerationId: v.optional(v.id("cat_name_generations")),
    createdAt: v.number(),
  }).index("by_userId_normalizedName", ["userId", "normalizedName"]),

  /**
   * One-off ceremony unlock (£7.99 / $9.99). Gates progression from portrait/payment
   * checkpoint into naming stages; store provider ids for Stripe reconciliation.
   */
  cat_payments: defineTable({
    userId: v.id("users"),
    catId: v.id("cats"),
    provider: v.literal("stripe"),
    stripeCheckoutSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    amountMinorUnits: v.number(),
    currency: v.string(),
    status: paymentStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_catId", ["catId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  /**
   * Optional history for Step 10 images if you allow retries; latest winner can also
   * be denormalized on cats.characterImageStorageId for simple dashboards.
   */
  cat_character_images: defineTable({
    catId: v.id("cats"),
    imageStorageId: v.id("_storage"),
    generationIndex: v.number(),
    createdAt: v.number(),
  }).index("by_catId_generationIndex", ["catId", "generationIndex"]),

  /**
   * Immutable snapshot row when the certificate is finalized (audit, re-download,
   * future multi-variant certificates). Mirrors key fields even if cats already holds them.
   */
  certificates: defineTable({
    catId: v.id("cats"),
    userId: v.id("users"),
    certificateStorageId: v.id("_storage"),
    snapshot: v.object({
      familyName: v.string(),
      familyRationale: v.string(),
      catWorldName: v.string(),
      catWorldRationale: v.string(),
      ineffableName: v.string(),
      ineffableRationale: v.string(),
    }),
    createdAt: v.number(),
  }).index("by_catId", ["catId"]),

  /**
   * Lightweight funnel instrumentation (upload → portrait → payment → names → certificate).
   * Emit from mutations/workflows with stable step keys for dashboards.
   */
  funnel_events: defineTable({
    userId: v.id("users"),
    catId: v.optional(v.id("cats")),
    /** e.g. "upload_complete", "portrait_accepted", "payment_succeeded", … */
    step: v.string(),
    occurredAt: v.number(),
    meta: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_catId_occurredAt", ["catId", "occurredAt"])
    .index("by_userId_occurredAt", ["userId", "occurredAt"]),
})
