import { cn } from "@/lib/utils"
import { AuthProvider } from "@/lib/auth-context"

export const metadata = {
  title: "CRM",
  description: "Sistema de gerenciamento de clientes, produtos, serviços e agendamentos.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}