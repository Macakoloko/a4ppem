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

const productFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().optional(),
  price: z.string().refine(value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
    message: "O preço deve ser um número válido e não negativo.",
  }),
  cost: z.string().optional()
    .refine(value => !value || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0), {
      message: "O custo deve ser um número válido e não negativo.",
    }),
  stock: z.string().optional()
    .refine(value => !value || (!isNaN(parseInt(value)) && parseInt(value) >= 0), {
      message: "O estoque deve ser um número inteiro não negativo.",
    }),
  category: z.string().min(1, {
    message: "A categoria é obrigatória.",
  }),
  image_url: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// Lista predefinida de categorias
const productCategories = [
  "Cabelo",
  "Unhas",
  "Maquiagem",
  "Pele",
  "Corpo",
  "Barbear",
  "Outros"
];

export function ProductForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      cost: "",
      stock: "0",
      category: "",
      image_url: "",
    },
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Verificar se já existe um produto com o mesmo nome
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', values.name)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingProduct) {
        setErrorMessage(`Já existe um produto com este nome: ${existingProduct.name}`);
        return;
      }
      
      // Converter os valores para os tipos corretos
      const productData = {
        name: values.name,
        description: values.description || null,
        price: parseFloat(values.price),
        cost: values.cost ? parseFloat(values.cost) : null,
        stock: values.stock ? parseInt(values.stock) : 0,
        category: values.category,
        image_url: values.image_url || null,
        active: true
      };
      
      // Inserir o novo produto no Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
      
      if (error) {
        throw error;
      }
      
      setSuccessMessage(`${values.name} foi cadastrado com sucesso!`);
      
      toast({
        title: "Produto cadastrado",
        description: `${values.name} foi adicionado com sucesso.`,
      });
      
      form.reset({
        name: "",
        description: "",
        price: "",
        cost: "",
        stock: "0",
        category: "",
        image_url: "",
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      setErrorMessage("Ocorreu um erro ao cadastrar o produto. Tente novamente.");
      toast({
        title: "Erro ao cadastrar produto",
        description: "Ocorreu um erro ao cadastrar o produto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Produto</CardTitle>
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
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do produto" {...field} />
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
                    <Textarea placeholder="Descrição do produto" {...field} />
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
                    <FormLabel>Preço de Venda (€)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo (€) (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        {productCategories.map((category) => (
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
            </div>
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
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
                "Cadastrar Produto"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

