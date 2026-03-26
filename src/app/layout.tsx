import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import "@fontsource-variable/inter"
import "./globals.css"

export const metadata: Metadata = {
  title: "Capacitor Updater",
  description: "Self-hosted OTA bundle update server for Capacitor apps",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
