export const USER_ROLES = ["member", "admin"] as const
export type UserRole = (typeof USER_ROLES)[number]

export type PostAction = "read" | "create" | "update" | "delete"

/** Pure RBAC helper — no session or DB; use from Convex after you know the role. */
export function can(role: UserRole, action: PostAction): boolean {
  if (role === "admin") return true
  switch (action) {
    case "read":
    case "create":
    case "update":
      return true
    case "delete":
      return false
  }
}

export function roleRank(role: UserRole): number {
  return role === "admin" ? 1 : 0
}
