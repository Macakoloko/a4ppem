"use client"

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    console.log("Auth component - Tentando autenticar com:", email)
    setIsLoading(true)
    setMessage(null)

    try {
      // Tentativa de login
      console.log("Auth component - Executando signIn")
      const { error: signInError, success: signInSuccess } = await signIn(email, password)
      
      console.log("Auth component - Resultado signIn:", { error: signInError?.message, success: signInSuccess })
      
      if (signInSuccess) {
        console.log("Auth component - Login bem-sucedido, aguardando redirecionamento...")
        setMessage({
          type: 'success',
          text: 'Login realizado com sucesso! Aguarde o redirecionamento...'
        })
        return
      }

      // Se falhou no login, mostra erro
      setMessage({
        type: 'error',
        text: 'Email ou senha incorretos. Tente novamente.'
      })
      
    } catch (error: any) {
      console.error("Auth component - Erro ao processar autenticação:", error)
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao processar sua solicitação. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para cadastrar novo usuário
  const handleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoading || !email || !password) return
    
    setIsLoading(true)
    setMessage(null)
    
    try {
      console.log("Auth component - Executando signUp")
      const { error: signUpError, success: signUpSuccess } = await signUp(email, password)
      
      console.log("Auth component - Resultado signUp:", { error: signUpError?.message, success: signUpSuccess })
      
      if (signUpError) {
        if (signUpError.message?.includes('User already registered')) {
          setMessage({
            type: 'error',
            text: 'Este email já está cadastrado. Tente fazer login.'
          })
        } else {
          throw signUpError
        }
        return
      }

      if (signUpSuccess) {
        setMessage({
          type: 'success',
          text: 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.'
        })
        setEmail('')
        setPassword('')
      }
    } catch (error: any) {
      console.error("Auth component - Erro ao processar cadastro:", error)
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao processar sua solicitação. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full auth-card">
      <CardHeader className="space-y-1 auth-header">
        <CardTitle className="text-2xl font-bold auth-title">Login / Cadastro</CardTitle>
        <CardDescription className="auth-description">Entre com seu email e senha para acessar o sistema</CardDescription>
      </CardHeader>
      <CardContent className="auth-content">
        <form onSubmit={handleSubmit} className="space-y-4 auth-form">
          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
              {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="auth-input"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="auth-input"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? 'Processando...' : 'Entrar'}
            </Button>
            <Button type="button" variant="outline" className="auth-button-outline" onClick={handleSignUp} disabled={isLoading}>
              Cadastrar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 