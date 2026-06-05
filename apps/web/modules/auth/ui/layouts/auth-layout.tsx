import { dataComponent } from "@/lib/data-component"

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      {...dataComponent("AuthLayout")}
      className="flex h-full min-h-screen min-w-screen flex-col items-center justify-center"
    >
      {children}
    </div>
  )
}
