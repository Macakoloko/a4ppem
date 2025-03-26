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
  MessageCircle,
  Gift,
  Loader2,
  UserRound,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
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

// Esquema de validação do formulário de edição
const editFormSchema = z.object({
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

// Definir o tipo de cliente
interface Client {
  id: string
  name: string
  whatsapp: string
  birthday?: string | null
  email?: string | null
  address?: string | null
  services: number
}

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Estado para ordenação
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      birthday: "",
      email: "",
      address: "",
    },
  })

  // Função auxiliar para verificar se uma tabela existe
  const checkTableExists = async (tableName: string) => {
    try {
      // Verificar se podemos ler dados da tabela
      const { error } = await supabase.from(tableName).select("count").limit(1)

      // Se não houver erro, a tabela existe
      return !error
    } catch (error) {
      console.error(`Erro ao verificar a tabela ${tableName}:`, error)
      return false
    }
  }

  // Fetch clients from Supabase
  useEffect(() => {
    async function fetchClients() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        // Verificar se o cliente Supabase está inicializado corretamente
        if (!supabase) {
          throw new Error("Cliente Supabase não inicializado")
        }

        // Verificar se a tabela 'clients' existe
        const tableExists = await checkTableExists("clients")
        if (!tableExists) {
          throw new Error("A tabela 'clients' não foi encontrada no banco de dados")
        }

        let query = supabase.from("clients").select("*")

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
        const clientsData = Array.isArray(data) ? data : []
        setClients(clientsData)
      } catch (error) {
        console.error("Error fetching clients:", error)
        const errorMessage =
          error instanceof Error ? error.message : "Não foi possível carregar a lista de clientes."
        setErrorMessage(errorMessage)
        toast({
          title: "Erro ao carregar clientes",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [sortField, sortDirection])

  // Filtrar clientes com base no termo de busca
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.whatsapp.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Paginação
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage)

  // Funções para paginação
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Função para formatar a data no formato PT
  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-PT")
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

  // Manipulador para excluir cliente
  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setIsDeleteDialogOpen(true)
  }

  // Manipulador para confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (clientToDelete) {
      try {
        setIsSubmitting(true)
        setErrorMessage(null)

        const { error } = await supabase.from("clients").delete().eq("id", clientToDelete.id)

        if (error) {
          throw error
        }

        setClients(clients.filter((client) => client.id !== clientToDelete.id))
        toast({
          title: "Cliente removido",
          description: `${clientToDelete.name} foi removido com sucesso.`,
        })
      } catch (error) {
        console.error("Error deleting client:", error)
        setErrorMessage("Ocorreu um erro ao remover o cliente.")
        toast({
          title: "Erro ao remover cliente",
          description: "Ocorreu um erro ao remover o cliente. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsDeleteDialogOpen(false)
        setClientToDelete(null)
        setIsSubmitting(false)
      }
    }
  }

  // Manipulador para editar cliente
  const handleEditClick = (client: Client) => {
    setClientToEdit(client)
    editForm.reset({
      name: client.name,
      whatsapp: client.whatsapp || "+351 ",
      birthday: client.birthday || "",
      email: client.email || "",
      address: client.address || "",
    })
    setIsEditDialogOpen(true)
  }

  // Manipulador para confirmar edição
  const handleEditSubmit = async (values: z.infer<typeof editFormSchema>) => {
    if (clientToEdit) {
      try {
        setIsSubmitting(true)
        setErrorMessage(null)

        // Verificar se já existe outro cliente com o mesmo número
        if (values.whatsapp !== clientToEdit.whatsapp) {
          const { data: existingClient, error: checkError } = await supabase
            .from("clients")
            .select("id, name")
            .eq("whatsapp", values.whatsapp)
            .neq("id", clientToEdit.id)
            .maybeSingle()

          if (checkError) {
            throw checkError
          }

          if (existingClient) {
            setErrorMessage(`Já existe um cliente com este número: ${existingClient.name}`)
            return
          }
        }

        const { data, error } = await supabase
          .from("clients")
          .update({
            name: values.name,
            whatsapp: values.whatsapp,
            birthday: values.birthday || null,
            email: values.email || null,
            address: values.address || null,
          })
          .eq("id", clientToEdit.id)
          .select()

        if (error) {
          throw error
        }

        // Update the client in the local state
        setClients(
          clients.map((client) =>
            client.id === clientToEdit.id ? { ...client, ...values } : client
          )
        )

        toast({
          title: "Cliente atualizado",
          description: `${values.name} foi atualizado com sucesso.`,
        })

        setIsEditDialogOpen(false)
        setClientToEdit(null)
      } catch (error) {
        console.error("Error updating client:", error)
        setErrorMessage("Ocorreu um erro ao atualizar o cliente.")
        toast({
          title: "Erro ao atualizar cliente",
          description: "Ocorreu um erro ao atualizar o cliente. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Função para enviar WhatsApp
  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Olá ${name}, `
    const encodedMessage = encodeURIComponent(message)
    const cleanPhone = phone.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank")
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>{filteredClients.length} clientes encontrados</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
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
              <span className="ml-2">Carregando clientes...</span>
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
                    <TableHead>Telefone</TableHead>
                    <TableHead className="hidden md:table-cell">
                      <Button
                        variant="ghost"
                        className="p-0"
                        onClick={() => toggleSort("birthday")}
                      >
                        <span>Aniversário</span>
                        <Calendar className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0"
                        onClick={() => toggleSort("services")}
                      >
                        <span>Serviços</span>
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.length > 0 ? (
                    paginatedClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.whatsapp}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(client.birthday)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {client.email || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.services > 0 ? "default" : "secondary"}>
                            {client.services || 0}
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
                              <DropdownMenuItem onClick={() => handleEditClick(client)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleWhatsApp(client.whatsapp, client.name)}
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                <span>WhatsApp</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(client)}>
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
                      <TableCell colSpan={6} className="h-24 text-center">
                        {searchTerm ? (
                          <>
                            <UserRound className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2">Nenhum cliente encontrado com "{searchTerm}"</p>
                          </>
                        ) : (
                          <>
                            <UserRound className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2">Nenhum cliente cadastrado</p>
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
        {!isLoading && filteredClients.length > 0 && (
          <CardFooter className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando <strong>{Math.min(startIndex + 1, filteredClients.length)}</strong> a{" "}
              <strong>{Math.min(startIndex + itemsPerPage, filteredClients.length)}</strong> de{" "}
              <strong>{filteredClients.length}</strong> clientes
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
              Tem certeza que deseja excluir o cliente {clientToDelete?.name}?
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

      {/* Modal de Edição de Cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Atualize as informações do cliente aqui.</DialogDescription>
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
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
