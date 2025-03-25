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

const professionalFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "E-mail inválido.",
  }),
  phone: z.string().min(9, {
    message: "O telefone deve ter pelo menos 9 dígitos.",
  }),
  bio: z.string().optional(),
  speciality: z.string().min(1, {
    message: "A especialidade é obrigatória.",
  }),
  color: z.string().min(1, {
    message: "A cor é obrigatória.",
  }),
});

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

// Lista predefinida de especialidades
const specialities = [
  "Cabeleireiro",
  "Barbeiro",
  "Esteticista",
  "Manicure",
  "Maquiador",
  "Massagista",
  "Depiladora",
  "Gerente",
  "Outro"
];

// Lista de cores para identificação no calendário
const colorOptions = [
  { value: "#3B82F6", label: "Azul" },
  { value: "#10B981", label: "Verde" },
  { value: "#F59E0B", label: "Amarelo" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#8B5CF6", label: "Roxo" },
  { value: "#EF4444", label: "Vermelho" },
  { value: "#6B7280", label: "Cinza" },
];

export function ProfessionalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
      speciality: "",
      color: "#3B82F6",
    },
  });

  async function onSubmit(values: ProfessionalFormValues) {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Verificar se já existe um profissional com o mesmo email ou telefone
      const { data: existingProfessional, error: checkError } = await supabase
        .from('professionals')
        .select('id, name, email, phone')
        .or(`email.eq.${values.email},phone.eq.${values.phone}`)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingProfessional) {
        let message = "Já existe um profissional cadastrado com ";
        if (existingProfessional.email === values.email) {
          message += `este e-mail: ${existingProfessional.name} (${existingProfessional.email})`;
        } else {
          message += `este telefone: ${existingProfessional.name} (${existingProfessional.phone})`;
        }
        setErrorMessage(message);
        return;
      }
      
      // Inserir o novo profissional no Supabase
      const professionalData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        bio: values.bio || null,
        speciality: values.speciality,
        color: values.color,
        active: true
      };
      
      const { data, error } = await supabase
        .from('professionals')
        .insert([professionalData])
        .select();
      
      if (error) {
        throw error;
      }
      
      setSuccessMessage(`${values.name} foi cadastrado com sucesso!`);
      
      toast({
        title: "Profissional cadastrado",
        description: `${values.name} foi adicionado com sucesso.`,
      });
      
      form.reset({
        name: "",
        email: "",
        phone: "",
        bio: "",
        speciality: "",
        color: "#3B82F6",
      });
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
      setErrorMessage("Ocorreu um erro ao cadastrar o profissional. Tente novamente.");
      toast({
        title: "Erro ao cadastrar profissional",
        description: "Ocorreu um erro ao cadastrar o profissional. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Profissional</CardTitle>
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
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do profissional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+351 123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="speciality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma especialidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialities.map((speciality) => (
                          <SelectItem key={speciality} value={speciality}>
                            {speciality}
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
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Breve descrição do profissional, experiência, certificações, etc." 
                      {...field} 
                    />
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
                "Cadastrar Profissional"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 