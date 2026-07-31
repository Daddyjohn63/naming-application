import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * Convex database schema for the naming ceremony app.
 *
 * KB-004 adds: summary pipeline `ceremonyStep` substates, `photoValidation` /
 * `summaryGenerationError` on `cats`, and the `cat_summary_versions` table.
 */

/** Lifecycle position in the guided naming ceremony (Phase 1 funnel). */
const ceremonyStep = v.union(
  v.literal("draft"),
  /** Vision model checking uploaded photo (KB-004 §2.3a). */
  v.literal("awaiting_photo_validation"),
  /** Cat photo passed likelihood but quality is poor; user must confirm. */
  v.literal("photo_quality_review"),
  /** Photo + description saved; summary job may run or be queued. */
  v.literal("awaiting_summary"),
  /** Summary exists; user may manually edit or submit to lock. */
  v.literal("summary_review"),
  /** Summary locked; user picks family name style(s) (KB-005). */
  v.literal("family_style"),
  /** AI generating the first or regenerated family-name batch (KB-006). */
  v.literal("awaiting_family_names"),
  /** Ten family names ready; shortlist, favourite, paywall teaser (KB-006). */
  v.literal("family_curation"),
  /** User must complete one-off unlock before cat-world naming (KB-007). */
  v.literal("awaiting_payment"),
  /** Legacy — treat as family_curation if encountered. */
  v.literal("family_preview"),
  /** Legacy post-unlock family step — superseded by free family_curation (KB-006). */
  v.literal("naming_family"),
  /** AI generating the first or regenerated cat-world name batch (KB-009). */
  v.literal("awaiting_cat_world_names"),
  /** Ten cat-world names ready; shortlist, favourite, global claim (KB-009). */
  v.literal("naming_cat_world"),
  /** AI generating the first or regenerated ineffable near-name batch (KB-010). */
  v.literal("awaiting_ineffable_names"),
  /** Ten ineffable near-names ready; shortlist and favourite (KB-010). */
  v.literal("naming_ineffable"),
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

const paymentProvider = v.union(v.literal("stub"), v.literal("stripe"))

/** KB-005 — must match `FAMILY_NAME_STYLE_IDS` in @workspace/shared/constants/family-naming. */
const familyNameStyleId = v.union(
  v.literal("elegant"),
  v.literal("silly"),
  v.literal("classic"),
  v.literal("nature_inspired"),
  v.literal("non_human_names"),
)

const catSex = v.union(v.literal("male"), v.literal("female"))

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
    /**
     * Mirrored from Clerk public metadata (`role: "admin"`).
     * Optional so existing rows stay valid until webhook re-sync.
     */
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    /**
     * Lifetime cat ceremony creates (product quota). Monotonic — deleteCeremony
     * must not decrement. Optional until `ensureMyCatCeremonyQuotaBaseline` or a
     * successful create initializes it from owned cats (one-time durable baseline).
     */
    catsCreatedTotal: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  /**
   * One row per cat profile / naming ceremony (Phase 1 “one or more cat profiles”).
   * Holds funnel step, regeneration budgets, pointers to assets, and final choices.
   * Original upload stays in photoStorageId; accepted summary text lives on
   * cat_summary_versions with optional acceptedSummaryVersionId here.
   */
  cats: defineTable({
    userId: v.id("users"),
    /** Friendly label in lists (“Whiskers”, “New kitten”). */
    title: v.string(),
    /** Optional URL slug once you expose shareable certificate/profile routes. */
    slug: v.optional(v.string()),
    /** Owner-written personality / story (AI naming input). */
    description: v.string(),
    /** Name the cat already goes by (optional). */
    existingName: v.optional(v.string()),
    /** Optional sex for summary pronouns. */
    sex: v.optional(catSex),
    /** Free-text age label, e.g. "3 years" (optional). */
    age: v.optional(v.string()),
    breed: v.optional(v.string()),
    /** Uploaded cat photo reference (Convex file storage). Required to submit the profile for summary generation; optional while drafting. */
    photoStorageId: v.optional(v.id("_storage")),
    /** Latest §2.3a vision validation payload after photo submit. */
    photoValidation: v.optional(
      v.object({
        isCat: v.boolean(),
        isSingleCat: v.boolean(),
        catLikelihoodScore: v.number(),
        qualityScore: v.number(),
        userMessage: v.string(),
        blockReason: v.string(),
        validatedAt: v.number(),
      }),
    ),
    /** User chose to continue past a poor-quality photo warning. */
    photoQualityAcknowledged: v.optional(v.boolean()),
    /** Last summary/validation pipeline error for retry UI. */
    summaryGenerationError: v.optional(v.string()),
    /** Successful KB-003 profile submits (cap in shared constants). */
    profileSubmitsUsed: v.optional(v.number()),
    /** AI vision photo checks consumed for this cat (cap in shared constants). */
    photoValidationAttemptsUsed: v.optional(v.number()),
    ceremonyStep,
    /** AI summary regenerations already consumed (cap at 1 per §4a). */
    summaryRegenerationsUsed: v.number(),
    /** Accepted summary row; naming stages should read copy from this version. */
    acceptedSummaryVersionId: v.optional(v.id("cat_summary_versions")),
    /** Family name styles chosen in free phase (KB-005). */
    familyNameStyles: v.optional(v.array(familyNameStyleId)),
    /** Saved family names during curation (max 6, unique by normalized name). */
    familyNameShortlist: v.optional(
      v.array(
        v.object({
          name: v.string(),
          rationale: v.string(),
          source: v.optional(v.union(v.literal("ai"), v.literal("custom"))),
        }),
      ),
    ),
    /** AI batch regenerations consumed for family names (max 1 per §4a). */
    familyNameRegenerationsUsed: v.optional(v.number()),
    /** Last family-name generation error for retry UI. */
    familyNameGenerationError: v.optional(v.string()),
    /** Saved cat-world names during curation (max 6, unique by normalized name). */
    catWorldNameShortlist: v.optional(
      v.array(
        v.object({
          name: v.string(),
          rationale: v.string(),
        }),
      ),
    ),
    /** AI batch regenerations consumed for cat-world names (max 1 per §4a). */
    catWorldNameRegenerationsUsed: v.optional(v.number()),
    /** Last cat-world name generation error for retry UI. */
    catWorldNameGenerationError: v.optional(v.string()),
    /** Saved ineffable near-names during curation (max 6). */
    ineffableNameShortlist: v.optional(
      v.array(
        v.object({
          name: v.string(),
          rationale: v.string(),
        }),
      ),
    ),
    /** AI batch regenerations consumed for ineffable names (max 1 per §4a). */
    ineffableNameRegenerationsUsed: v.optional(v.number()),
    /** Last ineffable name generation error for retry UI. */
    ineffableNameGenerationError: v.optional(v.string()),
    /** Successful unlock tied to this ceremony (see cat_payments). */
    ceremonyPaymentId: v.optional(v.id("cat_payments")),
    /** Final picks + rationales copied here for certificate & fast dashboard reads. */
    selectedFamilyName: v.optional(v.string()),
    selectedFamilyRationale: v.optional(v.string()),
    selectedCatWorldName: v.optional(v.string()),
    selectedCatWorldRationale: v.optional(v.string()),
    selectedIneffableName: v.optional(v.string()),
    selectedIneffableRationale: v.optional(v.string()),
    /** Rendered certificate asset (PDF/PNG) after ceremony completes. */
    certificateStorageId: v.optional(v.id("_storage")),
    ceremonyCompletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_userId_slug", ["userId", "slug"]),

  /**
   * Version history for the editable AI personality summary (KB-004).
   * Each AI run or meaningful user edit inserts a row; acceptance sets
   * cats.acceptedSummaryVersionId (and optionally locks the step forward).
   */
  cat_summary_versions: defineTable({
    catId: v.id("cats"),
    /** Narrative summary copy the user can edit (markdown or plain — app decides). */
    summaryText: v.string(),
    /** Optional vision-augmented image (Phase 1.5; not required in Phase 1). */
    summaryImageStorageId: v.optional(v.id("_storage")),
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
   * Globally reserved cat-world names (KB-009). One row per normalizedName worldwide.
   * When the user commits a cat-world choice, insert with unique normalizedName.
   */
  cat_world_name_claims: defineTable({
    userId: v.id("users"),
    normalizedName: v.string(),
    catId: v.id("cats"),
    /** Optional link to the generation row the label was picked from (audit). */
    sourceGenerationId: v.optional(v.id("cat_name_generations")),
    createdAt: v.number(),
  })
    .index("by_normalizedName", ["normalizedName"])
    .index("by_catId", ["catId"]),

  /**
   * One-off ceremony unlock (£2.99 / $3.99). Gates progression from preview/payment
   * checkpoint into full naming stages; store provider ids for Stripe reconciliation.
   */
  cat_payments: defineTable({
    userId: v.id("users"),
    catId: v.id("cats"),
    provider: paymentProvider,
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
   * Lightweight funnel instrumentation (upload → summary → style → preview → payment → names → certificate).
   * Emit from mutations/workflows with stable step keys for dashboards.
   */
  funnel_events: defineTable({
    userId: v.id("users"),
    catId: v.optional(v.id("cats")),
    /** e.g. "upload_complete", "summary_accepted", "payment_succeeded", … */
    step: v.string(),
    occurredAt: v.number(),
    meta: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_catId_occurredAt", ["catId", "occurredAt"])
    .index("by_userId_occurredAt", ["userId", "occurredAt"]),

  /**
   * In-app beta feedback: 1–5 star rating + free-text body.
   * One active review per user (enforced in submit mutation).
   * On account delete, reviews are anonymized (identity + free text cleared; rating kept).
   */
  beta_reviews: defineTable({
    /** Omitted after account delete anonymization. */
    userId: v.optional(v.id("users")),
    /** Integer 1–5; validated in the submit mutation. */
    rating: v.number(),
    /** Trimmed free text; may be empty for stars-only. */
    body: v.string(),
    /** Optional ceremony context when submitted from certificate flow. */
    catId: v.optional(v.id("cats")),
    source: v.union(v.literal("certificate"), v.literal("dashboard")),
    createdAt: v.number(),
    /** Set when the owning account was deleted; identity fields stripped. */
    anonymizedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),
})
