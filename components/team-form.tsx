"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogFooter } from "@/components/ui/dialog"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  role: z.string().min(1, {
    message: "A função é obrigatória.",
  }),
  phone: z.string().min(9, {
    message: "O telefone deve ter pelo menos 9 dígitos.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  services: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um serviço.",
  }),
  bio: z.string().optional(),
  status: z.string().default("active"),
})

const availableServices = [
  { id: "Corte de Cabelo", label: "Corte de Cabelo" },
  { id: "Coloração", label: "Coloração" },
  { id: "Tratamento Capilar", label: "Tratamento Capilar" },
  { id: "Manicure", label: "Manicure" },
  { id: "Pedicure", label: "Pedicure" },
  { id: "Barba", label: "Barba" },
  { id: "Tratamento Facial", label: "Tratamento Facial" },
  { id: "Maquilhagem", label: "Maquilhagem" },
]

export function TeamForm({ onSubmit, onCancel }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      phone: "+351 ",
      email: "",
      services: [],
      bio: "",
      status: "active",
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do profissional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cabeleireiro(a)">Cabeleireiro(a)</SelectItem>
                  <SelectItem value="Barbeiro">Barbeiro</SelectItem>
                  <SelectItem value="Manicure">Manicure</SelectItem>
                  <SelectItem value="Esteticista">Esteticista</SelectItem>
                  <SelectItem value="Maquilhador(a)">Maquilhador(a)</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="+351 912 345 678" {...field} />
                </FormControl>
                <FormDescription className="text-xs">Formato português: +351 9XX XXX XXX</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.pt" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="services"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>Serviços</FormLabel>
                <FormDescription className="text-xs">
                  Selecione os serviços que este profissional realiza
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableServices.map((service) => (
                  <FormField
                    key={service.id}
                    control={form.control}
                    name="services"
                    render={({ field }) => {
                      return (
                        <FormItem key={service.id} className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(service.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, service.id])
                                  : field.onChange(field.value?.filter((value) => value !== service.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{service.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Breve descrição sobre o profissional" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Adicionar Profissional</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

