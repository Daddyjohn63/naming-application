/**
 * Third-party services that set or read cookies (or similar client identifiers)
 * when used on the site. Keep Privacy Policy copy aligned with this list.
 */
export type CookieThirdParty = {
  id: string
  name: string
  purpose: string
  privacyPolicyUrl: string
}

export const COOKIE_THIRD_PARTIES = [
  {
    id: "google-analytics",
    name: "Google Analytics",
    purpose:
      "Helps us understand how visitors use the site so we can improve it.",
    privacyPolicyUrl: "https://policies.google.com/privacy",
  },
  {
    id: "clerk",
    name: "Clerk",
    purpose:
      "Provides secure sign-in, session management, and account authentication.",
    privacyPolicyUrl: "https://clerk.com/legal/privacy",
  },
] as const satisfies readonly CookieThirdParty[]
