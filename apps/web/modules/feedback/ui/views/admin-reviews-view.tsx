"use client"

import { format } from "date-fns"
import { Star } from "lucide-react"
import { useEffect } from "react"
import { useAction, usePaginatedQuery, useQuery } from "convex/react"

import { dataComponent } from "@/lib/data-component"
import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"

const PAGE_SIZE = 20

function formatReviewerName(user: {
  email: string
  firstName?: string
  lastName?: string
}, anonymized: boolean): string {
  if (anonymized) {
    return "Deleted account"
  }
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  if (name.length > 0) {
    return name
  }
  return user.email.length > 0 ? user.email : "Unknown user"
}

/** Admin-only paginated list of beta reviews. */
export function AdminReviewsView() {
  const isAdmin = useQuery(api.betaReviews.isAdmin)
  const syncMyRoleFromClerk = useAction(api.usersActions.syncMyRoleFromClerk)
  const { results, status, loadMore } = usePaginatedQuery(
    api.betaReviews.listBetaReviewsForAdmin,
    isAdmin === true ? {} : "skip",
    { initialNumItems: PAGE_SIZE },
  )

  useEffect(() => {
    if (isAdmin !== false) {
      return
    }
    let cancelled = false
    void (async () => {
      try {
        await syncMyRoleFromClerk({})
      } catch (error) {
        if (!cancelled) {
          console.warn("Failed to sync admin role from Clerk", error)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin, syncMyRoleFromClerk])

  if (isAdmin === undefined) {
    return (
      <p
        {...dataComponent("AdminReviewsView")}
        className="text-sm text-muted-foreground"
      >
        Loading…
      </p>
    )
  }

  if (isAdmin === false) {
    return (
      <div
        {...dataComponent("AdminReviewsUnauthorized")}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-3 py-16 text-center"
      >
        <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          This page doesn&apos;t exist or you don&apos;t have access to it.
        </p>
      </div>
    )
  }

  return (
    <div
      {...dataComponent("AdminReviewsView")}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8"
    >
      <header className="space-y-3">
        <h1 className="font-sans text-3xl font-semibold tracking-tight">
          Beta reviews
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Feedback submitted by authenticated beta users. Treat emails and free
          text as confidential.
        </p>
      </header>

      {status === "LoadingFirstPage" ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {results.map((review) => (
            <li
              key={review._id}
              className="flex flex-col gap-2 border-b border-border/60 pb-4 last:border-b-0"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  className="inline-flex items-center gap-0.5 text-amber-500"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className="size-4"
                      fill={index < review.rating ? "currentColor" : "none"}
                      aria-hidden
                    />
                  ))}
                </span>
                <span className="text-sm font-medium">
                  {formatReviewerName(review.user, review.anonymized)}
                </span>
                {!review.anonymized && review.user.email.length > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    {review.user.email}
                  </span>
                ) : null}
                {review.anonymized ? (
                  <span className="text-xs text-muted-foreground">
                    Anonymized
                  </span>
                ) : null}
              </div>
              {review.body.length > 0 ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {review.body}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No written comments
                </p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>Source: {review.source}</span>
                <span>
                  {format(new Date(review.createdAt), "d MMM yyyy, HH:mm")}
                </span>
                {review.catId !== undefined ? (
                  <span className="font-mono">cat: {review.catId}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {status === "CanLoadMore" ? (
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => loadMore(PAGE_SIZE)}
        >
          Load more
        </Button>
      ) : null}
      {status === "LoadingMore" ? (
        <p className="text-sm text-muted-foreground">Loading more…</p>
      ) : null}
    </div>
  )
}
