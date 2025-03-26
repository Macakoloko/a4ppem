"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const serviceFormSchema = z.object({
  value: z.string().min(1, {
    message: "O valor é obrigatório.",
  }),
  date: z.string().min(1, {
    message: "A data é obrigatória.",
  }),
  description: z.string().min(3, {
    message: "A descrição deve ter pelo menos 3 caracteres.",
  }),
  category: z.string().min(1, {
    message: "A categoria é obrigatória.",
  }),
  client: z.string().min(1, {
    message: "O cliente é obrigatório.",
  }),
})

const productFormSchema = z.object({
  value: z.string().min(1, {
    message: "O valor é obrigatório.",
  }),
  date: z.string().min(1, {
    message: "A data é obrigatória.",
  }),
  product: z.string().min(1, {
    message: "O produto é obrigatório.",
  }),
  quantity: z.string().min(1, {
    message: "A quantidade é obrigatória.",
  }),
  client: z.string().min(1, {
    message: "O cliente é obrigatório.",
  }),
})

export function IncomeForm() {
  const serviceForm = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      value: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      client: "",
    },
  })

  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      value: "",
      date: new Date().toISOString().split("T")[0],
      product: "",
      quantity: "1",
      client: "",
    },
  })

  function onSubmitService(values: z.infer<typeof serviceFormSchema>) {
    toast({
      title: "Serviço registrado",
      description: `Valor: € ${values.value} - ${values.description}`,
    })
    serviceForm.reset({
      value: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      client: "",
    })
  }

  function onSubmitProduct(values: z.infer<typeof productFormSchema>) {
    toast({
      title: "Venda de produto registrada",
      description: `Valor: € ${values.value} - Quantidade: ${values.quantity}`,
    })
    productForm.reset({
      value: "",
      date: new Date().toISOString().split("T")[0],
      product: "",
      quantity: "1",
      client: "",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Recebimento</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="service" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="service">Serviço</TabsTrigger>
            <TabsTrigger value="product">Produto</TabsTrigger>
          </TabsList>

          <TabsContent value="service" className="mt-6">
            <Form {...serviceForm}>
              <form onSubmit={serviceForm.handleSubmit(onSubmitService)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={serviceForm.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (€)</FormLabel>
                        <FormControl>
                          <Input placeholder="0,00" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={serviceForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={serviceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva o serviço realizado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={serviceForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="haircut">Corte de Cabelo</SelectItem>
                            <SelectItem value="coloring">Coloração</SelectItem>
                            <SelectItem value="manicure">Manicure</SelectItem>
                            <SelectItem value="pedicure">Pedicure</SelectItem>
                            <SelectItem value="treatment">Tratamento</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={serviceForm.control}
                    name="client"
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
                            <SelectItem value="1">Ana Silva</SelectItem>
                            <SelectItem value="2">Carlos Oliveira</SelectItem>
                            <SelectItem value="3">Mariana Santos</SelectItem>
                            <SelectItem value="4">Roberto Almeida</SelectItem>
                            <SelectItem value="5">Juliana Costa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Registrar Serviço
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="product" className="mt-6">
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={productForm.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total (€)</FormLabel>
                        <FormControl>
                          <Input placeholder="0,00" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={productForm.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Shampoo Hidratante</SelectItem>
                            <SelectItem value="2">Condicionador Reparador</SelectItem>
                            <SelectItem value="3">Máscara de Tratamento</SelectItem>
                            <SelectItem value="4">Óleo de Argan</SelectItem>
                            <SelectItem value="5">Coloração 7.0</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={productForm.control}
                  name="client"
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
                          <SelectItem value="1">Ana Silva</SelectItem>
                          <SelectItem value="2">Carlos Oliveira</SelectItem>
                          <SelectItem value="3">Mariana Santos</SelectItem>
                          <SelectItem value="4">Roberto Almeida</SelectItem>
                          <SelectItem value="5">Juliana Costa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Registrar Venda de Produto
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

