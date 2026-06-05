import { dataComponent } from "@/lib/data-component"

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
