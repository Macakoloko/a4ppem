"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const serviceFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().optional(),
  price: z.string().refine(value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
    message: "O preço deve ser um número válido e não negativo.",
  }),
  duration: z.string().refine(value => !isNaN(parseInt(value)) && parseInt(value) > 0, {
    message: "A duração deve ser um número inteiro positivo.",
  }),
  category: z.string().min(1, {
    message: "A categoria é obrigatória.",
  }),
  color: z.string().min(1, {
    message: "A cor é obrigatória.",
  }),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

// Lista predefinida de categorias
const serviceCategories = [
  "Cabelo",
  "Barba",
  "Unhas",
  "Maquiagem",
  "Massagem",
  "Depilação",
  "Outros"
];

// Lista de cores para o calendário
const colorOptions = [
  { value: "#3B82F6", label: "Azul" },
  { value: "#10B981", label: "Verde" },
  { value: "#F59E0B", label: "Amarelo" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#8B5CF6", label: "Roxo" },
  { value: "#EF4444", label: "Vermelho" },
  { value: "#6B7280", label: "Cinza" },
];

export function ServiceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      duration: "60",
      category: "",
      color: "#3B82F6",
    },
  });

  async function onSubmit(values: ServiceFormValues) {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Verificar se já existe um serviço com o mesmo nome
      const { data: existingService, error: checkError } = await supabase
        .from('services')
        .select('id, name')
        .ilike('name', values.name)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingService) {
        setErrorMessage(`Já existe um serviço com este nome: ${existingService.name}`);
        return;
      }
      
      // Converter os valores para os tipos corretos
      const serviceData = {
        name: values.name,
        description: values.description || null,
        price: parseFloat(values.price),
        duration: parseInt(values.duration),
        category: values.category,
        color: values.color,
        active: true
      };
      
      // Inserir o novo serviço no Supabase
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();
      
      if (error) {
        throw error;
      }
      
      setSuccessMessage(`${values.name} foi cadastrado com sucesso!`);
      
      toast({
        title: "Serviço cadastrado",
        description: `${values.name} foi adicionado com sucesso.`,
      });
      
      form.reset({
        name: "",
        description: "",
        price: "",
        duration: "60",
        category: "",
        color: "#3B82F6",
      });
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      setErrorMessage("Ocorreu um erro ao cadastrar o serviço. Tente novamente.");
      toast({
        title: "Erro ao cadastrar serviço",
        description: "Ocorreu um erro ao cadastrar o serviço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Serviço</CardTitle>
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
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do serviço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do serviço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (€)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input placeholder="60" type="number" min="5" step="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
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
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor no Calendário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center">
                              <div
                                className="h-4 w-4 rounded-full mr-2"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Serviço"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

