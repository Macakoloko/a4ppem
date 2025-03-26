"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative min-h-screen">
        <div className="absolute right-4 top-4">
          <ModeToggle />
        </div>
        {children}
      </div>
    </ThemeProvider>
  )
} 