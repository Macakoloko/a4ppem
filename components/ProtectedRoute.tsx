"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"

export function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, loading } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Marcamos que estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirecionamento para login (se necessário)
  useEffect(() => {
    // Só verificamos quando o componente está montado no cliente
    // e quando o carregamento inicial do usuário terminou
    if (isClient && !loading) {
      if (!user && !isRedirecting) {
        console.log("🔐 ProtectedRoute: Usuário não autenticado, redirecionando para login...")
        setIsRedirecting(true)
        // Usamos window.location para fazer um redirecionamento completo
        window.location.href = '/login'
      } else if (user) {
        console.log("✅ ProtectedRoute: Usuário autenticado, permitindo acesso")
      }
    }
  }, [user, loading, isClient, isRedirecting])

  // Estado de carregamento - ainda não sabemos se o usuário está autenticado
  if (loading || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se estiver redirecionando para o login
  if (!user || isRedirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-muted-foreground">Redirecionando para o login...</p>
        </div>
      </div>
    )
  }

  // Se chegou aqui, o usuário está autenticado e podemos mostrar o conteúdo protegido
  return <>{children}</>
} 