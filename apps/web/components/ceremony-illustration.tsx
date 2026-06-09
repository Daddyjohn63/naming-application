import { CatWorldMarkPaths } from "@/components/marks/cat-world-mark"
import { FamilyMarkPaths } from "@/components/marks/family-mark"
import { IneffableMarkPaths } from "@/components/marks/ineffable-mark"
import { dataComponent } from "@/lib/data-component"
import { cn } from "@workspace/ui/lib/utils"

type CeremonyIllustrationProps = React.SVGProps<SVGSVGElement>

/** Theme-aware family name illustration; fill follows parent `color` via `currentColor`. */
export function FamilyIllustration({
  className,
  ...props
}: CeremonyIllustrationProps) {
  return (
    <svg
      {...dataComponent("FamilyIllustration")}
      viewBox="0 0 2000 2000"
      fill="currentColor"
      aria-hidden
      className={cn("size-12 shrink-0", className)}
      {...props}
    >
      <FamilyMarkPaths />
    </svg>
  )
}

/** Theme-aware cat-world name illustration; fill follows parent `color` via `currentColor`. */
export function CatWorldIllustration({
  className,
  ...props
}: CeremonyIllustrationProps) {
  return (
    <svg
      {...dataComponent("CatWorldIllustration")}
      viewBox="0 0 2000 2000"
      fill="currentColor"
      aria-hidden
      className={cn("size-12 shrink-0", className)}
      {...props}
    >
      <CatWorldMarkPaths />
    </svg>
  )
}

/** Theme-aware ineffable name illustration; fill follows parent `color` via `currentColor`. */
export function IneffableIllustration({
  className,
  ...props
}: CeremonyIllustrationProps) {
  return (
    <svg
      {...dataComponent("IneffableIllustration")}
      viewBox="0 0 2000 2000"
      fill="currentColor"
      aria-hidden
      className={cn("size-12 shrink-0", className)}
      {...props}
    >
      <IneffableMarkPaths />
    </svg>
  )
}
