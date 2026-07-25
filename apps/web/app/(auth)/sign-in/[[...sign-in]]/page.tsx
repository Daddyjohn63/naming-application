import { SignInView } from "@/modules/auth/ui/views/sign-in-view"
import { createPageMetadata, NO_INDEX_ROBOTS } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata = createPageMetadata({
  title: "Sign in",
  description: `Sign in to ${APP_NAME} to continue your cat's naming ceremony.`,
  path: "/sign-in",
  robots: NO_INDEX_ROBOTS,
})

const Page = () => {
  return <SignInView />
}

export default Page
