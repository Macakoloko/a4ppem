import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

// Middleware simplificado para evitar ciclos de redirecionamento
export async function middleware(request: NextRequest) {
  try {
    // Create a response and get the user session
    const response = createClient(request)
    
    return response
  } catch (error) {
    console.error("❌ Middleware: Erro -", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Rotas que o middleware irá processar
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 