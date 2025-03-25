"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, Search, ArrowUp, ArrowDown, Edit, Trash2, AlertCircle } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"

// Definições de tipos
interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string
  color: string
  active: boolean
  created_at: string
  updated_at: string
}

// Schema para edição do serviço
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
  active: z.boolean(),
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

export function ServiceList() {
  // Estados para gerenciar serviços e UI
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Service>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Configurações de paginação
  const itemsPerPage = 5;
  
  // Form para edição de serviço
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "",
      color: "#3B82F6",
      active: true,
    },
  });
  
  // Buscar serviços do Supabase
  async function fetchServices() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar se a tabela "services" existe
      const { data: tableData, error: tableError } = await supabase
        .from('services')
        .select('*')
        .limit(1);
        
      if (tableError && tableError.message.includes('does not exist')) {
        setError("A tabela 'services' não existe no banco de dados. Por favor, execute o script de configuração.");
        setServices([]);
        setFilteredServices([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setError("Não foi possível carregar os serviços. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }
  
  // Efeito para buscar serviços ao carregar o componente
  useEffect(() => {
    fetchServices();
  }, []);
  
  // Efeito para filtrar serviços quando o termo de busca muda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredServices(services);
    } else {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      const filtered = services.filter(
        service => 
          service.name.toLowerCase().includes(normalizedSearchTerm) || 
          (service.description && service.description.toLowerCase().includes(normalizedSearchTerm)) ||
          service.category.toLowerCase().includes(normalizedSearchTerm)
      );
      setFilteredServices(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, services]);
  
  // Função para ordenar serviços
  function handleSort(field: keyof Service) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    
    // Aplicar a ordenação
    const sorted = [...filteredServices].sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      // Lidar com valores null ou undefined
      if (valueA === null || valueA === undefined) return sortDirection === "asc" ? -1 : 1;
      if (valueB === null || valueB === undefined) return sortDirection === "asc" ? 1 : -1;
      
      // Ordenar por string
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc" 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // Ordenar por número
      return sortDirection === "asc" 
        ? Number(valueA) - Number(valueB)
        : Number(valueB) - Number(valueA);
    });
    
    setFilteredServices(sorted);
  }
  
  // Calcular serviços da página atual
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calcular total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  
  // Funções de navegação
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }
  
  // Abrir diálogo de exclusão
  function handleDeleteClick(serviceId: string) {
    setDeletingServiceId(serviceId);
    setIsDeleteDialogOpen(true);
  }
  
  // Excluir serviço
  async function deleteService() {
    if (!deletingServiceId) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deletingServiceId);
        
      if (error) {
        throw error;
      }
      
      // Atualizar lista local
      const updatedServices = services.filter(service => service.id !== deletingServiceId);
      setServices(updatedServices);
      
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast({
        title: "Erro ao excluir serviço",
        description: "Ocorreu um erro ao excluir o serviço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setDeletingServiceId(null);
      setIsDeleteDialogOpen(false);
    }
  }
  
  // Abrir formulário de edição
  function handleEditClick(service: Service) {
    setEditingService(service);
    setIsEditing(true);
    
    form.reset({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      color: service.color,
      active: service.active,
    });
  }
  
  // Atualizar serviço
  async function handleUpdateService(values: ServiceFormValues) {
    if (!editingService) return;
    
    try {
      setIsLoading(true);
      
      // Verificar se já existe um serviço com o mesmo nome e ID diferente
      if (values.name !== editingService.name) {
        const { data: existingService, error: checkError } = await supabase
          .from('services')
          .select('id')
          .eq('name', values.name)
          .neq('id', editingService.id)
          .maybeSingle();
        
        if (checkError) {
          throw checkError;
        }
        
        if (existingService) {
          toast({
            title: "Erro ao atualizar serviço",
            description: `Já existe um serviço com o nome ${values.name}`,
            variant: "destructive"
          });
          return;
        }
      }
      
      // Atualizar serviço no Supabase
      const { data, error } = await supabase
        .from('services')
        .update({
          name: values.name,
          description: values.description || null,
          price: parseFloat(values.price),
          duration: parseInt(values.duration),
          category: values.category,
          color: values.color,
          active: values.active,
        })
        .eq('id', editingService.id)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Atualizar lista local
      if (data && data.length > 0) {
        const updatedService = data[0] as Service;
        const updatedServices = services.map(service => 
          service.id === updatedService.id ? updatedService : service
        );
        setServices(updatedServices);
      }
      
      toast({
        title: "Serviço atualizado",
        description: `${values.name} foi atualizado com sucesso.`,
      });
      
      setIsEditing(false);
      setEditingService(null);
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast({
        title: "Erro ao atualizar serviço",
        description: "Ocorreu um erro ao atualizar o serviço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Renderizar paginação
  function renderPagination() {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }).map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => goToPage(index + 1)}
                isActive={currentPage === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }
  
  // Função para formatar preço em euros
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Serviços</CardTitle>
        <CardDescription>
          Gerencie todos os serviços disponíveis no sistema
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
        
        <div className="flex items-center mb-4">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "Nenhum serviço encontrado com esse termo de busca." : "Nenhum serviço cadastrado."}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                      Nome
                      {sortField === "name" && (
                        sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead onClick={() => handleSort("category")} className="cursor-pointer hidden md:table-cell">
                      Categoria
                      {sortField === "category" && (
                        sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead onClick={() => handleSort("price")} className="cursor-pointer text-right">
                      Preço
                      {sortField === "price" && (
                        sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead onClick={() => handleSort("duration")} className="cursor-pointer text-right hidden md:table-cell">
                      Duração
                      {sortField === "duration" && (
                        sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: service.color }}
                          />
                          {service.name}
                          {!service.active && (
                            <span className="text-xs bg-gray-200 px-1 rounded ml-1">Inativo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{service.category}</TableCell>
                      <TableCell className="text-right">{formatPrice(service.price)}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">{service.duration} min</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEditClick(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(service.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {renderPagination()}
          </>
        )}
        
        {/* Diálogo de edição de serviço */}
        <Dialog open={isEditing} onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) setEditingService(null);
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Serviço</DialogTitle>
              <DialogDescription>
                Atualize as informações do serviço abaixo.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateService)} className="space-y-4">
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
                        <Textarea placeholder="Descrição do serviço" {...field} value={field.value || ""} />
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
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ativo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Serviços inativos não aparecerão nos agendamentos.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
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
        
        {/* Diálogo de confirmação de exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteService} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir Serviço"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

