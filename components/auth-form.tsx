"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const authFormSchema = z.object({
  email: z.string().email({
    message: "E-mail inválido.",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
})

type AuthFormValues = z.infer<typeof authFormSchema>

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: AuthFormValues) {
    try {
      setError(null)
      if (isSignUp) {
        await signUp(values.email, values.password)
      } else {
        await signIn(values.email, values.password)
        router.push("/")
      }
    } catch (error) {
      console.error("Erro de autenticação:", error)
      setError(
        isSignUp
          ? "Erro ao criar conta. Tente novamente."
          : "E-mail ou senha incorretos. Tente novamente."
      )
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignUp ? "Criar Conta" : "Entrar"}</CardTitle>
        <CardDescription>
          {isSignUp
            ? "Crie sua conta para acessar o sistema"
            : "Entre com suas credenciais para acessar o sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="exemplo@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Criando conta..." : "Entrando..."}
                </>
              ) : isSignUp ? (
                "Criar Conta"
              ) : (
                "Entrar"
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isSubmitting}
            >
              {isSignUp ? "Já tem uma conta? Entre" : "Não tem uma conta? Crie uma"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
