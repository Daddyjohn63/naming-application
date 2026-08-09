/**
 * Scheduled maintenance jobs.
 */

import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

/** Daily prune of error_events older than the retention window (see errorEvents.ts). */
crons.interval(
  "purge expired error events",
  { hours: 24 },
  internal.errorEvents.purgeExpiredErrorEvents,
)

export default crons
