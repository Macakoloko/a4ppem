"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  whatsapp: z.string().min(9, {
    message: "O telefone deve ter pelo menos 9 dígitos.",
  }),
  birthday: z.string().optional(),
  email: z
    .string()
    .email({
      message: "Email inválido.",
    })
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
})

export function ClientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      whatsapp: "+351 ",
      birthday: "",
      email: "",
      address: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      setSuccessMessage(null)
      
      // Verificar se já existe um cliente com o mesmo número de telefone
      const { data: existingClient, error: checkError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('whatsapp', values.whatsapp)
        .maybeSingle()
      
      if (checkError) {
        throw checkError
      }
      
      if (existingClient) {
        setErrorMessage(`Já existe um cliente com este número: ${existingClient.name}`)
        return
      }
      
      // Insert the new client into Supabase
      const { data, error } = await supabase
        .from('clients')
        .insert([
          { 
            name: values.name,
            whatsapp: values.whatsapp,
            birthday: values.birthday || null,
            email: values.email || null,
            address: values.address || null,
            services: 0
          }
        ])
        .select()
      
      if (error) {
        throw error
      }
      
      setSuccessMessage(`${values.name} foi cadastrado com sucesso!`)
      
      toast({
        title: "Cliente cadastrado",
        description: `${values.name} foi adicionado com sucesso.`,
      })
      
      form.reset({
        name: "",
        whatsapp: "+351 ",
        birthday: "",
        email: "",
        address: "",
      })
    } catch (error) {
      console.error('Error adding client:', error)
      setErrorMessage("Ocorreu um erro ao cadastrar o cliente. Tente novamente.")
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro ao cadastrar o cliente. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="+351 912 345 678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Aniversário</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.pt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Morada (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Morada do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Cliente"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

