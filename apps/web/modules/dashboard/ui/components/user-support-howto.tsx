import { dataComponent } from "@/lib/data-component"
import { APP_NAME } from "@workspace/shared/constants/app"
import { MAX_STANDARD_USER_CAT_CEREMONIES } from "@workspace/shared/constants/cat-ceremony-limits"
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
    body: `From your dashboard, choose Add a cat. Each cat gets their own naming ceremony, and you can work on more than one (up to ${MAX_STANDARD_USER_CAT_CEREMONIES} per account). Come back anytime from the dashboard. If you delete a ceremony, it still counts toward that account total — so only delete if you’re sure.`,
  },
  {
    title: "Build a profile",
    body: "Give the ceremony a title, tell your cat’s story, and upload a clear photo. The photo is needed for the personality summary and the certificate. We check that the picture really shows a single cat before you continue. You can save a draft and finish later.",
  },
  {
    title: "Review the summary",
    body: `${APP_NAME} writes a personality summary from your story and photo. Edit it until it sounds like your cat, then submit when you’re happy — that summary guides every name that follows.`,
  },
  {
    title: "Pick a family-name style",
    body: "Choose one or more flavours for the everyday name you call your cat at home — for example Elegant, Silly, Classic, Nature-inspired, or Non-human names.",
  },
  {
    title: "Choose the family name",
    body: `You’ll see ${FAMILY_NAME_BATCH_SIZE} suggestions, each with a short note about why it fits. Save favourites to a shortlist, ask for a fresh set once if you like, or add a name of your own. Then pick one favourite to continue.`,
  },
  {
    title: "Unlock the rest of the ceremony",
    body: "Everything up to the family name is free. During beta, unlocking the cat-world name, ineffable near-name, and certificate is free too — no charge, and you stay on the ceremony page.",
  },
  {
    title: "Choose the cat-world name",
    body: `After unlock you get another set of ${NAME_BATCH_SIZE} names. Shortlist favourites, optionally ask for a fresh set once, then confirm one. Cat-world names are unique across ${APP_NAME} — once you claim one, no other cat can take it.`,
  },
  {
    title: "Choose the ineffable near-name",
    body: "This is our poetic take on the secret third name from T. S. Eliot’s poem — the one a cat keeps to itself. Same simple flow: suggestions, shortlist, one optional fresh set, then a favourite.",
  },
  {
    title: "Generate the certificate",
    body: "You’ll see all three names together. You can tweak the everyday family name one last time, then generate and download a PDF certificate. Reopen it anytime from the ceremony page.",
  },
] as const

const NAME_TYPES = [
  {
    title: "Family name (everyday name)",
    body: "The name you call your cat at home — warm, practical, and personal. This stage is free. You choose a style first, then pick from suggestions (and you may add one name of your own to the shortlist).",
  },
  {
    title: "Cat-world name",
    body: `Inspired by Eliot’s idea that every cat has a second name known only among cats. Ours are unique across ${APP_NAME}: when you confirm a favourite, it’s reserved so no other ceremony can use it.`,
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
          from a short profile and personality summary to three names and a
          downloadable certificate. You can stop at any time; progress is saved,
          and the dashboard lets you resume exactly where you left off.
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
            an everyday family name, a unique cat-world name, and an ineffable
            near-name.
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
            How a ceremony unfolds
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
            Follow these steps in order. The progress steps at the top of each
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
            How you choose each name
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-pretty text-muted-foreground">
            Family, cat-world, and ineffable naming all work the same way, so
            once you’ve done the first stage the others will feel familiar.
          </p>
        </div>
        <ol className="mx-auto grid max-w-3xl list-none gap-3 sm:grid-cols-2">
          {[
            {
              step: "1",
              title: "Browse suggestions",
              body: `${NAME_BATCH_SIZE} names appear, each with a short note about why it might fit.`,
            },
            {
              step: "2",
              title: "Build a shortlist",
              body: `Save up to ${MAX_SHORTLIST_TOTAL} names you like. You can remove and re-add freely while you’re still choosing.`,
            },
            {
              step: "3",
              title: "Ask for a fresh set (optional)",
              body: `Want more ideas? You can ask for a new set ${MAX_NAME_REGENERATIONS === 1 ? "once" : `${MAX_NAME_REGENERATIONS} times`} (${NAME_BATCH_SIZE} new names) and keep shortlisting from both sets.`,
            },
            {
              step: "4",
              title: "Pick a favourite",
              body: "Choose one shortlisted name to lock this stage and move on. Before you confirm, you can still switch to another name on your shortlist.",
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
          <span className="font-medium text-foreground">
            Family names only:
          </span>{" "}
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
            A few limits keep each ceremony fair and focused. If you run out of
            photo checks or name refreshes on one ceremony, you can start another
            from the dashboard (while you still have ceremonies left on your
            account), or contact support.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full min-w-xl border-collapse text-left text-sm">
            <caption className="sr-only">
              {APP_NAME} ceremony limits for profiles, photos, and naming
            </caption>
            <thead className="border-b border-border/70 bg-muted/30">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  What
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  How many
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Ceremonies on your account
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Up to {MAX_STANDARD_USER_CAT_CEREMONIES} naming ceremonies in
                  total. Deleting one does not let you start an extra one later.
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Profile updates
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Up to {MAX_CAT_PROFILE_SUBMIT_COUNT} times you can submit a
                  cat’s profile (each submit can refresh the summary)
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Photo checks
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Up to {MAX_PHOTO_VALIDATION_ATTEMPTS} photo checks per
                  ceremony — if they run out, start a new ceremony or contact
                  support
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Names each time
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {NAME_BATCH_SIZE} suggestions at a time (for family,
                  cat-world, and ineffable)
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Fresh name sets
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {MAX_FAMILY_NAME_REGENERATIONS} fresh set per naming stage
                  (family, cat-world, and ineffable each get their own)
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Shortlist size
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Up to {MAX_SHORTLIST_TOTAL} names saved per naming stage
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium">
                  Your own family name
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  Add{" "}
                  {MAX_CUSTOM_FAMILY_NAMES === 1
                    ? "one"
                    : MAX_CUSTOM_FAMILY_NAMES}{" "}
                  name of your own to the family shortlist (not available for
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
            like. After you submit, changing the profile writes a new summary
            and counts as one of your profile updates.
          </p>
        </div>
      </section>
    </div>
  )
}
