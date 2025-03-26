import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  try {
    // Create a response and get the user session
    const response = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.delete({
              name,
              ...options,
            })
            response.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // Handle authentication based on session
    if (error) throw error

    return response
  } catch (error) {
    console.error("❌ Middleware: Error -", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Rotas que o middleware irá processar
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
