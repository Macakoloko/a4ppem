"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<{
    error: any | null
    success: boolean
  }>
  signUp: (email: string, password: string) => Promise<{
    error: any | null
    success: boolean
  }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Função para recuperar a sessão atual
  const getSession = useCallback(async () => {
    try {
      console.log("⏳ AuthContext: Obtendo sessão...")
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("❌ AuthContext: Erro ao obter sessão -", error)
        return null
      }
      
      console.log("✅ AuthContext: Sessão obtida -", data.session ? "Autenticado" : "Não autenticado")
      return data.session
    } catch (err) {
      console.error("💥 AuthContext: Erro ao obter sessão -", err)
      return null
    }
  }, [])

  // Inicializa o estado de autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🚀 AuthContext: Inicializando...")
      setLoading(true)
      
      try {
        // Verificar se já existe uma sessão
        const currentSession = await getSession()
        
        if (currentSession) {
          console.log("👤 AuthContext: Usuário encontrado -", currentSession.user.email)
          setSession(currentSession)
          setUser(currentSession.user)
        } else {
          console.log("🔒 AuthContext: Nenhum usuário autenticado")
          setSession(null)
          setUser(null)
        }
      } catch (err) {
        console.error("💥 AuthContext: Erro na inicialização -", err)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Configurar o listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("🔄 AuthContext: Evento de autenticação -", event)
        
        if (event === 'SIGNED_IN' && newSession) {
          console.log("✅ AuthContext: Usuário fez login -", newSession.user.email)
          setSession(newSession)
          setUser(newSession.user)
        } 
        else if (event === 'SIGNED_OUT') {
          console.log("🚪 AuthContext: Usuário fez logout")
          setSession(null)
          setUser(null)
        } 
        else if (event === 'TOKEN_REFRESHED' && newSession) {
          console.log("🔄 AuthContext: Token atualizado")
          setSession(newSession)
          setUser(newSession.user)
        }
        
        setLoading(false)
      }
    )

    return () => {
      console.log("🧹 AuthContext: Limpando listeners")
      subscription.unsubscribe()
    }
  }, [getSession])

  // Função de login
  const signIn = useCallback(
    async (email: string, password: string) => {
      console.log("🔑 AuthContext: Iniciando login para -", email)
      setLoading(true)
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error("❌ AuthContext: Erro de login -", error.message)
          return { error, success: false }
        }

        console.log("✅ AuthContext: Login bem-sucedido -", data.user?.email)
        setUser(data.user)
        setSession(data.session)
        
        // Forçar navegação direta para contornar possíveis problemas de middleware
        setTimeout(() => {
          console.log("🚀 AuthContext: Navegando diretamente para /dashboard")
          window.location.href = "/dashboard"
        }, 500)
        
        return { error: null, success: true }
      } catch (error) {
        console.error("💥 AuthContext: Exceção durante login -", error)
        return { error, success: false }
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  // Função de cadastro
  const signUp = useCallback(
    async (email: string, password: string) => {
      console.log("📝 AuthContext: Iniciando cadastro para -", email)
      setLoading(true)
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })

        if (error) {
          console.error("❌ AuthContext: Erro de cadastro -", error.message)
          return { error, success: false }
        }

        console.log("✅ AuthContext: Cadastro bem-sucedido -", data.user?.email)
        return { error: null, success: true }
      } catch (error) {
        console.error("💥 AuthContext: Exceção durante cadastro -", error)
        return { error, success: false }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Função de logout
  const signOut = useCallback(async () => {
    console.log("🚪 AuthContext: Iniciando logout")
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("❌ AuthContext: Erro ao fazer logout -", error)
        throw error
      }
      
      console.log("✅ AuthContext: Logout bem-sucedido")
      setUser(null)
      setSession(null)
      
      // Forçar navegação direta para contornar possíveis problemas de middleware
      setTimeout(() => {
        console.log("🚀 AuthContext: Navegando diretamente para /login")
        window.location.href = "/login"
      }, 500)
    } catch (error) {
      console.error("💥 AuthContext: Erro ao fazer logout -", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 