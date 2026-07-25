import { SignUpView } from "@/modules/auth/ui/views/sign-up-view"
import { createPageMetadata, NO_INDEX_ROBOTS } from "@/lib/seo/metadata"
import { APP_NAME } from "@workspace/shared/constants/app"

export const metadata = createPageMetadata({
  title: "Sign up",
  description: `Create a free ${APP_NAME} account and start your cat's naming ceremony.`,
  path: "/sign-up",
  robots: NO_INDEX_ROBOTS,
})

const Page = () => {
  return <SignUpView />
}

export default Page
