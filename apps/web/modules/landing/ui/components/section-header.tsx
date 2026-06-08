import { dataComponent } from "@/lib/data-component"

export type SectionHeaderProps = {
  eyebrow: string
  title: string
  description: string
}

/** Centered section header — pass eyebrow, title, and description via props. */
export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <section
      {...dataComponent("SectionHeader")}
      className="w-full border-b border-border/40"
    >
      <div className="bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl dark:text-white">
            {title}
          </h2>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
