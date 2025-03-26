"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit,
  MoreHorizontal,
  Search,
  Trash2,
  Package,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/utils/supabase/client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Esquema para validação do formulário de edição
const editProductSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().optional(),
  price: z.string().refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
    message: "O preço deve ser um número válido e não negativo.",
  }),
  cost: z
    .string()
    .optional()
    .refine((value) => !value || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0), {
      message: "O custo deve ser um número válido e não negativo.",
    }),
  stock: z
    .string()
    .optional()
    .refine((value) => !value || (!isNaN(parseInt(value)) && parseInt(value) >= 0), {
      message: "O estoque deve ser um número inteiro não negativo.",
    }),
  category: z.string().min(1, {
    message: "A categoria é obrigatória.",
  }),
  image_url: z.string().optional(),
})

// Lista predefinida de categorias
const productCategories = ["Cabelo", "Unhas", "Maquiagem", "Pele", "Corpo", "Barbear", "Outros"]

// Interface para o produto
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  cost: number | null
  stock: number
  category: string
  image_url: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Estado para ordenação
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  const editForm = useForm<z.infer<typeof editProductSchema>>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      cost: "",
      stock: "",
      category: "",
      image_url: "",
    },
  })

  // Buscar produtos do Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        // Verificar se o cliente Supabase está inicializado corretamente
        if (!supabase) {
          throw new Error("Cliente Supabase não inicializado")
        }

        // Verificar se a tabela 'products' existe
        const { error: tableCheckError } = await supabase.from("products").select("count").limit(1)

        if (tableCheckError) {
          throw new Error(
            "A tabela de produtos não foi encontrada. Certifique-se de configurar o banco de dados corretamente."
          )
        }

        let query = supabase.from("products").select("*")

        // Aplicar ordenação
        if (sortDirection === "asc") {
          query = query.order(sortField, { ascending: true })
        } else {
          query = query.order(sortField, { ascending: false })
        }

        const { data, error } = await query

        if (error) {
          console.error("Erro na consulta Supabase:", error)
          throw error
        }

        // Verificar se os dados recebidos são um array
        const productsData = Array.isArray(data) ? data : []
        setProducts(productsData)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        const errorMsg =
          error instanceof Error ? error.message : "Não foi possível carregar a lista de produtos."
        setErrorMessage(errorMsg)
        toast({
          title: "Erro ao carregar produtos",
          description: errorMsg,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [sortField, sortDirection])

  // Filtrar produtos com base no termo de busca
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  // Funções para paginação
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Função para alterar a ordenação
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Função para formatar preço
  const formatCurrency = (value: number | null) => {
    if (value === null) return "N/A"
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value)
  }

  // Manipulador para excluir produto
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  // Manipulador para confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        setIsSubmitting(true)
        setErrorMessage(null)

        const { error } = await supabase.from("products").delete().eq("id", productToDelete.id)

        if (error) {
          throw error
        }

        setProducts(products.filter((product) => product.id !== productToDelete.id))
        toast({
          title: "Produto removido",
          description: `${productToDelete.name} foi removido com sucesso.`,
        })
      } catch (error) {
        console.error("Erro ao remover produto:", error)
        setErrorMessage("Ocorreu um erro ao remover o produto.")
        toast({
          title: "Erro ao remover produto",
          description: "Ocorreu um erro ao remover o produto. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsDeleteDialogOpen(false)
        setProductToDelete(null)
        setIsSubmitting(false)
      }
    }
  }

  // Manipulador para editar produto
  const handleEditClick = (product: Product) => {
    setProductToEdit(product)
    editForm.reset({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      cost: product.cost ? product.cost.toString() : "",
      stock: product.stock.toString(),
      category: product.category,
      image_url: product.image_url || "",
    })
    setIsEditDialogOpen(true)
  }

  // Manipulador para confirmar edição
  const handleEditSubmit = async (values: z.infer<typeof editProductSchema>) => {
    if (productToEdit) {
      try {
        setIsSubmitting(true)
        setErrorMessage(null)

        // Verificar se já existe outro produto com o mesmo nome
        if (values.name !== productToEdit.name) {
          const { data: existingProduct, error: checkError } = await supabase
            .from("products")
            .select("id, name")
            .ilike("name", values.name)
            .neq("id", productToEdit.id)
            .maybeSingle()

          if (checkError) {
            throw checkError
          }

          if (existingProduct) {
            setErrorMessage(`Já existe um produto com este nome: ${existingProduct.name}`)
            return
          }
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
        }

        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productToEdit.id)
          .select()

        if (error) {
          throw error
        }

        // Atualizar o produto no estado local
        setProducts(
          products.map((product) =>
            product.id === productToEdit.id ? { ...product, ...productData } : product
          )
        )

        toast({
          title: "Produto atualizado",
          description: `${values.name} foi atualizado com sucesso.`,
        })

        setIsEditDialogOpen(false)
        setProductToEdit(null)
      } catch (error) {
        console.error("Erro ao atualizar produto:", error)
        setErrorMessage("Ocorreu um erro ao atualizar o produto.")
        toast({
          title: "Erro ao atualizar produto",
          description: "Ocorreu um erro ao atualizar o produto. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>{filteredProducts.length} produtos encontrados</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando produtos...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" className="p-0" onClick={() => toggleSort("name")}>
                        <span>Nome</span>
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0"
                        onClick={() => toggleSort("category")}
                      >
                        <span>Categoria</span>
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" className="p-0" onClick={() => toggleSort("price")}>
                        <span>Preço</span>
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" className="p-0" onClick={() => toggleSort("stock")}>
                        <span>Estoque</span>
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(product)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Remover</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {searchTerm ? (
                          <>
                            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2">Nenhum produto encontrado com "{searchTerm}"</p>
                          </>
                        ) : (
                          <>
                            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2">Nenhum produto cadastrado</p>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {!isLoading && filteredProducts.length > 0 && (
          <CardFooter className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando <strong>{Math.min(startIndex + 1, filteredProducts.length)}</strong> a{" "}
              <strong>{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</strong> de{" "}
              <strong>{filteredProducts.length}</strong> produtos
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima página</span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Modal de Confirmação para Excluir */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto {productToDelete?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Produto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Atualize as informações do produto.</DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                control={editForm.control}
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
