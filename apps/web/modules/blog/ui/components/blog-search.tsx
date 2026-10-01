"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

type BlogSearchContextValue = {
  query: string
  setQuery: (value: string) => void
  clear: () => void
}

const BlogSearchContext = React.createContext<BlogSearchContextValue | null>(
  null
)

export function BlogSearchProvider({
  query: queryFromUrl,
  children,
}: {
  query: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQueryState] = React.useState(queryFromUrl)

  React.useEffect(() => {
    const onPopState = () => {
      const next = new URLSearchParams(window.location.search).get("q") ?? ""
      setQueryState(next)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const setQuery = React.useCallback(
    (value: string) => {
      setQueryState(value)
      const params = new URLSearchParams()
      if (value.length > 0) params.set("q", value)
      const next = params.toString()
      router.replace(next.length > 0 ? `${pathname}?${next}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router]
  )

  const clear = React.useCallback(() => {
    setQuery("")
  }, [setQuery])

  const value = React.useMemo(
    () => ({ query, setQuery, clear }),
    [clear, query, setQuery]
  )

  return (
    <BlogSearchContext.Provider value={value}>
      {children}
    </BlogSearchContext.Provider>
  )
}

export function useBlogSearch(): BlogSearchContextValue {
  const value = React.useContext(BlogSearchContext)
  if (!value) {
    throw new Error(
      "Search is only available on the blog index and category pages."
    )
  }
  return value
}

export function BlogSearchField() {
  const { query, setQuery, clear } = useBlogSearch()

  return (
    <form role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="relative">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the journal"
          aria-label="Search the journal"
          className={
            query.length > 0
              ? "pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
              : "pl-8 [&::-webkit-search-cancel-button]:hidden"
          }
        />
        {query.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={clear}
            aria-label="Clear search"
          >
            <XIcon />
          </Button>
        ) : null}
      </div>
    </form>
  )
}
