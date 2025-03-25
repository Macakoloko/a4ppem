"use client"

import { useAuth as useAuthContext } from "@/context/auth-context"

// Este hook está mantido apenas para compatibilidade com código existente
// Todo o código novo deve usar o hook de contexto diretamente
export const useAuth = () => {
  return useAuthContext()
} 