"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Client, Professional, Service } from "@/types/supabase"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"

const appointmentFormSchema = z.object({
  client_id: z.string({ required_error: "Selecione um cliente" }),
  professional_id: z.string({ required_error: "Selecione um profissional" }),
  service_id: z.string({ required_error: "Selecione um serviço" }),
  date: z.date({ required_error: "Selecione uma data" }),
  start_time: z.string({ required_error: "Selecione um horário" }),
  notes: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

export function AppointmentForm() {
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  })

  useEffect(() => {
    fetchData()
    checkTableStructure()
  }, [])

  async function checkTableStructure() {
    try {
      console.log("Verificando estrutura da tabela appointments...")
      const { data, error } = await supabase.from('appointments').select('*').limit(1)
      
      if (error) {
        console.error("Erro ao verificar tabela:", error)
      } else {
        console.log("Estrutura da tabela:", data ? Object.keys(data[0] || {}) : "Sem dados")
      }
    } catch (error) {
      console.error("Erro ao verificar estrutura:", error)
    }
  }

  async function fetchData() {
    try {
      const [clientsResponse, professionalsResponse, servicesResponse] = await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("professionals").select("*").eq("active", true).order("name"),
        supabase.from("services").select("*").eq("active", true).order("name"),
      ])

      if (clientsResponse.error) throw clientsResponse.error
      if (professionalsResponse.error) throw professionalsResponse.error
      if (servicesResponse.error) throw servicesResponse.error

      setClients(clientsResponse.data)
      setProfessionals(professionalsResponse.data)
      setServices(servicesResponse.data)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      toast.error("Erro ao buscar dados")
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(data: AppointmentFormValues) {
    try {
      setSubmitting(true)

      // Formatar a data corretamente antes de enviar (ISO 8601 para PostgreSQL)
      const formattedDate = format(data.date, "yyyy-MM-dd")

      // Buscar a duração do serviço
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("duration")
        .eq("id", data.service_id)
        .single()

      if (serviceError) throw serviceError

      // Calcular o horário de término
      const startTime = new Date(`2000-01-01T${data.start_time}:00`)
      const endTime = new Date(startTime.getTime() + service.duration * 60000)
      const end_time = format(endTime, "HH:mm:00")

      // Criar o objeto de agendamento com formatos específicos para PostgreSQL
      const appointmentData = {
        client_id: data.client_id,
        professional_id: data.professional_id,
        service_id: data.service_id,
        date: formattedDate,
        start_time: `${data.start_time}:00`,
        end_time: end_time,
        status: "scheduled",
        notes: data.notes || null,
      }

      console.log("Tentando inserir agendamento com dados formatados:", appointmentData)

      // Tentativa 1: Usar a API do Next.js para contornar problemas de cache
      try {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 409) {
            toast.error("Já existe um agendamento para este horário")
            return
          }
          throw new Error(errorData.error || "Erro ao criar agendamento")
        }

        const result = await response.json()
        console.log("Resposta da API:", result)
        toast.success("Agendamento criado com sucesso")
        form.reset()
        return
      } catch (apiError) {
        console.error("Erro na chamada da API:", apiError)
        // Se a API falhar, tenta o método direto com o Supabase
      }

      // Tentativa 2: Método direto com o Supabase 
      const { error: insertError } = await supabase
        .from("appointments")
        .insert(appointmentData)

      if (insertError) {
        console.error("Erro detalhado ao inserir:", insertError)
        
        // Se o erro for devido a uma entrada duplicada
        if (insertError.code === "23505" || 
            (insertError.message && insertError.message.includes("unique constraint"))) {
          toast.error("Já existe um agendamento para este horário")
          return
        }
        
        // Se for um erro de schema cache, instruir o usuário
        if (insertError.code === "PGRST204") {
          toast.error("Erro de cache do Supabase. Por favor, execute o script de correção.")
          return
        }
        
        throw insertError
      }

      toast.success("Agendamento criado com sucesso")
      form.reset()
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      toast.error("Erro ao criar agendamento")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Agendamento</CardTitle>
        <CardDescription>Agende um serviço para um cliente</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professional_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          {professional.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: pt })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={pt}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                          {`${hour.toString().padStart(2, "0")}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o agendamento"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Criando agendamento..." : "Criar agendamento"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

