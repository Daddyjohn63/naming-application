import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { MAX_CAT_PROFILE_SUBMIT_COUNT } from "@workspace/shared/constants/cat-profile"
import { MAX_PHOTO_VALIDATION_ATTEMPTS } from "@workspace/shared/constants/cat-photo-validation"
import {
  FAMILY_NAME_BATCH_SIZE,
  FAMILY_NAME_STYLE_LABELS,
  MAX_CUSTOM_FAMILY_NAMES,
  MAX_FAMILY_NAME_REGENERATIONS,
  MAX_FAMILY_SHORTLIST_TOTAL,
} from "@workspace/shared/constants/family-naming"
import {
  MAX_NAME_REGENERATIONS,
  MAX_SHORTLIST_TOTAL,
  NAME_BATCH_SIZE,
} from "@workspace/shared/constants/naming-curation"

const CEREMONY_FLOW_STEPS = [
  {
    title: "Start a ceremony",
    body: "From your dashboard, choose Add a cat. Each cat gets their own naming ceremony, so you can run several in parallel and return to any of them later.",
  },
  {
    title: "Build a profile",
    body: "Give the ceremony a title, tell your cat’s story, and upload a clear photo — required to generate the summary and for the certificate. We check it really is a single cat before continuing. You can still save a draft and come back later.",
  },
  {
    title: "Review the summary",
    body: `${APP_NAME} writes a personality summary from your story and photo. Edit it until it sounds like your cat, then submit when you’re happy — that locked summary becomes the creative truth behind every name that follows.`,
  },
  {
    title: "Pick a family-name style",
    body: "Choose one or more flavours for the everyday name you call your cat at home — for example Elegant, Silly, Classic, Nature-inspired, or Non-human names.",
  },
  {
    title: "Curate the family name",
    body: `You’ll see ${FAMILY_NAME_BATCH_SIZE} suggestions with a short rationale for each. Shortlist favourites, regenerate once if you want a fresh batch, or add one name of your own. Then pick a single favourite to continue.`,
  },
  {
    title: "Unlock the rest of the ceremony",
    body: "Everything up to the family name is free. During beta, unlocking the cat-world name, ineffable near-name, and certificate is free too — no charge, and you stay on the ceremony page.",
  },
  {
    title: "Choose the cat-world name",
    body: `After unlock you get another set of ${NAME_BATCH_SIZE} names. Shortlist, optionally regenerate once, then confirm a favourite. Cat-world names are globally unique — once claimed, no other ${APP_NAME} cat can take that name.`,
  },
  {
    title: "Choose the ineffable near-name",
    body: "This is our poetic approximation of the secret third name from T. S. Eliot’s poem — the one a cat keeps to itself. Same curation pattern: suggestions, shortlist, one optional regeneration, then a favourite.",
  },
  {
    title: "Generate the certificate",
    body: "You’ll see all three names together. You can tweak the everyday family name one last time, then generate and download a PDF certificate. Reopen it anytime from the ceremony page.",
  },
] as const

const NAME_TYPES = [
  {
    title: "Family name (everyday name)",
    body: "The name you call your cat at home — warm, practical, and personal. This stage is free. You choose a style first, then curate name suggestions from the app, and you may add one custom name of your own to the shortlist.",
  },
  {
    title: "Cat-world name",
    body: `Inspired by Eliot’s idea that every cat has a second name known only among cats. Ours are unique across ${APP_NAME}: when you confirm a favourite, it’s claimed globally so no other ceremony can use it.`,
  },
  {
    title: "Ineffable near-name",
    body: "A poetic stand-in for the third, secret name that no owner can truly know. The ceremony offers its best approximation — something that feels close, without pretending to reveal the unrevealable.",
  },
] as const

const STYLE_LABELS = Object.values(FAMILY_NAME_STYLE_LABELS)

/**
 * Dashboard how-to: ceremony journey, the three name types, and practical limits.
 */
export function UserSupportHowto() {
  return (
    <div {...dataComponent("UserSupportHowto")} className="space-y-12">
      <section aria-labelledby="howto-intro-heading" className="space-y-4">
        <h2
          id="howto-intro-heading"
          className="font-sans text-2xl font-semibold tracking-tight"
        >
          How {APP_NAME} works
        </h2>
        <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
          {APP_NAME} walks you through a guided naming ceremony for each cat —
          from a short profile and personality summary to three complementary
          names and a downloadable certificate. You can stop at any time; progress
          is saved, and the dashboard lets you resume exactly where you left off.
        </p>
      </section>

      <section aria-labelledby="name-types-heading" className="space-y-5">
        <div className="space-y-2">
          <h2
            id="name-types-heading"
            className="font-sans text-2xl font-semibold tracking-tight"
          >
            The three name types
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
            Every completed ceremony ends with three names that work together —
            everyday, unique among cats, and quietly ineffable.
          </p>
        </div>
        <ul className="grid list-none gap-4 sm:grid-cols-1 lg:grid-cols-3">
          {NAME_TYPES.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-border/70 bg-muted/20 p-5"
            >
              <h3 className="font-sans text-base font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="process-flow-heading" className="space-y-5">
        <div className="space-y-2">
          <h2
            id="process-flow-heading"
            className="font-sans text-2xl font-semibold tracking-tight"
          >
            Ceremony process flow
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
            Follow these steps in order. The progress pills at the top of each
            ceremony page always show where you are.
          </p>
        </div>
        <ol className="relative mx-auto max-w-3xl space-y-0 border-l border-border/80 pl-6">
          {CEREMONY_FLOW_STEPS.map((step, index) => (
            <li key={step.title} className="relative pb-8 last:pb-0">
              <span
                className="absolute top-0 -left-6 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground"
                aria-hidden
              >
                {index + 1}
              </span>
              <h3 className="font-sans text-base font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="curation-flow-heading" className="space-y-5">
        <div className="space-y-2">
          <h2
            id="curation-flow-heading"
            className="font-sans text-2xl font-semibold tracking-tight"
          >
            How name curation works
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
            Family, cat-world, and ineffable naming share the same curation
            pattern so each stage feels familiar once you’ve done the first.
          </p>
        </div>
        <ol className="mx-auto grid max-w-3xl list-none gap-3 sm:grid-cols-2">
          {[
            {
              step: "1",
              title: "Review a batch",
              body: `${NAME_BATCH_SIZE} suggestions appear, each with a short rationale.`,
            },
            {
              step: "2",
              title: "Build a shortlist",
              body: `Save up to ${MAX_SHORTLIST_TOTAL} names you like. You can remove and re-add freely while the stage is open.`,
            },
            {
              step: "3",
              title: "Regenerate once (optional)",
              body: `Want a fresh set? You can regenerate ${MAX_NAME_REGENERATIONS === 1 ? "once" : `${MAX_NAME_REGENERATIONS} times`} for ${NAME_BATCH_SIZE} new names and keep shortlisting across both batches.`,
            },
            {
              step: "4",
              title: "Pick a favourite",
              body: "Choose one shortlisted name to lock this stage and move forward. Before you confirm, you can still change your mind among the shortlist.",
            },
          ].map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-border/70 bg-background p-4"
            >
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Step {item.step}
              </p>
              <h3 className="mt-1 font-sans text-base font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="max-w-3xl text-sm leading-relaxed text-pretty text-muted-foreground">
          <span className="font-medium text-foreground">Family names only:</span>{" "}
          you can also add{" "}
          {MAX_CUSTOM_FAMILY_NAMES === 1
            ? "one name of your own"
            : `up to ${MAX_CUSTOM_FAMILY_NAMES} names of your own`}{" "}
          to the shortlist — handy if you already have a favourite everyday name
          in mind. Custom names count toward the same shortlist limit of{" "}
          {MAX_FAMILY_SHORTLIST_TOTAL}.
        </p>
      </section>

      <section aria-labelledby="limits-heading" className="space-y-5">
        <div className="space-y-2">
          <h2
            id="limits-heading"
            className="font-sans text-2xl font-semibold tracking-tight"
          >
            Limits at a glance
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
            These caps keep each ceremony fair and focused. If a ceremony runs
            out of regenerations or edits, start a new cat ceremony from the
            dashboard for a fresh set of budgets.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full min-w-xl border-collapse text-left text-sm">
            <caption className="sr-only">
              {APP_NAME} ceremony limits for profiles, photos, and name
              curation
            </caption>
            <thead className="border-b border-border/70 bg-muted/30">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Area
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Limit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Profile submissions
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Up to {MAX_CAT_PROFILE_SUBMIT_COUNT} successful profile
                  submissions per cat (each can regenerate the summary)
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Photo checks
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Up to {MAX_PHOTO_VALIDATION_ATTEMPTS} automated photo checks
                  per ceremony — if they run out, start a new ceremony or
                  contact support
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Names per generation
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {NAME_BATCH_SIZE} suggestions per batch (family, cat-world,
                  and ineffable)
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Regenerations
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {MAX_FAMILY_NAME_REGENERATIONS} regeneration per naming stage
                  (family, cat-world, and ineffable each get their own)
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Shortlist size
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Up to {MAX_SHORTLIST_TOTAL} names per naming stage
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Your own family name
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Add {MAX_CUSTOM_FAMILY_NAMES === 1 ? "one" : MAX_CUSTOM_FAMILY_NAMES}{" "}
                  custom name to the family shortlist (not available for
                  cat-world or ineffable)
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Unlock
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Free during beta — once per cat for cat-world, ineffable, and
                  certificate
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="max-w-3xl space-y-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              Family name styles:
            </span>{" "}
            {STYLE_LABELS.join(", ")}.
          </p>
          <p>
            <span className="font-medium text-foreground">Summary edits:</span>{" "}
            Before you submit, you can edit and save the summary as often as you
            like. After submit, editing the profile starts summary generation
            again and counts toward your profile submission limit.
          </p>
        </div>
      </section>
    </div>
  )
}
