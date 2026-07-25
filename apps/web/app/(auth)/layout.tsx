import { dataComponent } from "@/lib/data-component"
import { NO_INDEX_ROBOTS } from "@/lib/seo/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      {...dataComponent("AuthRouteLayout")}
      className="flex h-full min-h-screen min-w-screen flex-col items-center justify-center"
    >
      {children}
    </div>
  )
}

export default Layout
