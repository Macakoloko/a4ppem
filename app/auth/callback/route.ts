import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    console.log("📥 Auth Callback: Recebendo código de autenticação")
    
    if (!code) {
      console.error("❌ Auth Callback: Código ausente na requisição")
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    console.log("🔄 Auth Callback: Trocando código por sessão")
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
    
    console.log("✅ Auth Callback: Troca concluída, redirecionando para /clientes")
    return NextResponse.redirect(new URL('/clientes', request.url))
  } catch (error) {
    console.error("💥 Auth Callback: Erro durante o processamento - ", error)
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url))
  }
} 