import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { BackToTopButton } from "@/components/back-to-top-button"
import { ConditionalRootHeader } from "@/components/conditional-root-header"
import { PublicRouteShell } from "@/components/public-route-shell"
import { Providers } from "@/components/providers"
import { dataComponent } from "@/lib/data-component"
import { ClerkProvider } from "@clerk/nextjs"
import { cn } from "@workspace/ui/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body
        {...dataComponent("RootLayout")}
        className="flex min-h-svh flex-col"
      >
        <ClerkProvider>
          <Providers>
            <PublicRouteShell>
              <ConditionalRootHeader />

              <div className="flex flex-1 flex-col">{children}</div>
              <BackToTopButton />
            </PublicRouteShell>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
