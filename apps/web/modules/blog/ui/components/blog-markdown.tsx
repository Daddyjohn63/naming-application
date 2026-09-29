import Link from "next/link"
import type { Components } from "react-markdown"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { BlogImage } from "@/modules/blog/ui/components/blog-image"

const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-10 mb-4 font-serif text-3xl font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 font-serif text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 font-serif text-xl font-semibold tracking-tight">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-base leading-relaxed text-foreground/90">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => {
    const className =
      "font-medium underline decoration-primary/70 underline-offset-4 hover:text-primary"
    if (typeof href === "string" && href.startsWith("/")) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      )
    }
    const external = typeof href === "string" && /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-primary pl-4 font-serif text-foreground/90 italic">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    if (className) {
      return <code className={className}>{children}</code>
    }
    return (
      <code className="rounded bg-muted px-1 py-0.5 text-[0.9em]">
        {children}
      </code>
    )
  },
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-left font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/60 px-3 py-2 align-top">
      {children}
    </td>
  ),
  img: ({ src, alt }) => {
    if (typeof src !== "string" || src.length === 0) return null
    if (src.startsWith("https://")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- remote hosts stay off the image optimizer
        <img
          src={src}
          alt={alt ?? ""}
          className="my-6 h-auto w-full rounded-lg"
        />
      )
    }
    if (src.startsWith("/blog/")) {
      return (
        <BlogImage
          src={src}
          alt={alt ?? ""}
          className="my-6 h-auto w-full rounded-lg"
        />
      )
    }
    return null
  },
}

export function BlogMarkdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
      {source}
    </ReactMarkdown>
  )
}
