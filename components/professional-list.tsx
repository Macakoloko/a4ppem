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
interface Professional {
  id: string
  name: string
  email: string
  phone: string
  bio: string | null
  speciality: string
  color: string
  active: boolean
  created_at: string
  updated_at: string
}

// Schema para edição do profissional
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
  active: z.boolean(),
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

export function ProfessionalList() {
  // Estados para gerenciar profissionais e UI
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProfessionalId, setDeletingProfessionalId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Professional>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Configurações de paginação
  const itemsPerPage = 5;
  
  // Form para edição de profissional
  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
      speciality: "",
      color: "#3B82F6",
      active: true,
    },
  });
  
  // Buscar profissionais do Supabase
  async function fetchProfessionals() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar se a tabela "professionals" existe
      const { data: tableData, error: tableError } = await supabase
        .from('professionals')
        .select('*')
        .limit(1);
        
      if (tableError && tableError.message.includes('does not exist')) {
        setError("A tabela 'professionals' não existe no banco de dados. Por favor, execute o script de configuração.");
        setProfessionals([]);
        setFilteredProfessionals([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      setProfessionals(data || []);
      setFilteredProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      setError("Não foi possível carregar os profissionais. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }
  
  // Efeito para buscar profissionais ao carregar o componente
  useEffect(() => {
    fetchProfessionals();
  }, []);
  
  // Efeito para filtrar profissionais quando o termo de busca muda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProfessionals(professionals);
    } else {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      const filtered = professionals.filter(
        professional => 
          professional.name.toLowerCase().includes(normalizedSearchTerm) || 
          professional.email.toLowerCase().includes(normalizedSearchTerm) ||
          professional.phone.toLowerCase().includes(normalizedSearchTerm) ||
          professional.speciality.toLowerCase().includes(normalizedSearchTerm) ||
          (professional.bio && professional.bio.toLowerCase().includes(normalizedSearchTerm))
      );
      setFilteredProfessionals(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, professionals]);
  
  // Função para ordenar profissionais
  function handleSort(field: keyof Professional) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    
    // Aplicar a ordenação
    const sorted = [...filteredProfessionals].sort((a, b) => {
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
    
    setFilteredProfessionals(sorted);
  }
  
  // Calcular profissionais da página atual
  const paginatedProfessionals = filteredProfessionals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calcular total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredProfessionals.length / itemsPerPage));
  
  // Funções de navegação
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }
  
  // Abrir diálogo de exclusão
  function handleDeleteClick(professionalId: string) {
    setDeletingProfessionalId(professionalId);
    setIsDeleteDialogOpen(true);
  }
  
  // Excluir profissional
  async function deleteProfessional() {
    if (!deletingProfessionalId) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', deletingProfessionalId);
        
      if (error) {
        throw error;
      }
      
      // Atualizar lista local
      const updatedProfessionals = professionals.filter(professional => professional.id !== deletingProfessionalId);
      setProfessionals(updatedProfessionals);
      
      toast({
        title: "Profissional excluído",
        description: "O profissional foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast({
        title: "Erro ao excluir profissional",
        description: "Ocorreu um erro ao excluir o profissional. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setDeletingProfessionalId(null);
      setIsDeleteDialogOpen(false);
    }
  }
  
  // Abrir formulário de edição
  function handleEditClick(professional: Professional) {
    setEditingProfessional(professional);
    setIsEditing(true);
    
    form.reset({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      bio: professional.bio || "",
      speciality: professional.speciality,
      color: professional.color,
      active: professional.active,
    });
  }
  
  // Atualizar profissional
  async function handleUpdateProfessional(values: ProfessionalFormValues) {
    if (!editingProfessional) return;
    
    try {
      setIsLoading(true);
      
      // Verificar se já existe um profissional com o mesmo email ou telefone e ID diferente
      if (values.email !== editingProfessional.email || values.phone !== editingProfessional.phone) {
        const { data: existingProfessional, error: checkError } = await supabase
          .from('professionals')
          .select('id, name, email, phone')
          .or(`email.eq.${values.email},phone.eq.${values.phone}`)
          .neq('id', editingProfessional.id)
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
          toast({
            title: "Erro ao atualizar profissional",
            description: message,
            variant: "destructive"
          });
          return;
        }
      }
      
      // Atualizar profissional no Supabase
      const { data, error } = await supabase
        .from('professionals')
        .update({
          name: values.name,
          email: values.email,
          phone: values.phone,
          bio: values.bio || null,
          speciality: values.speciality,
          color: values.color,
          active: values.active,
        })
        .eq('id', editingProfessional.id)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Atualizar lista local
      if (data && data.length > 0) {
        const updatedProfessional = data[0] as Professional;
        const updatedProfessionals = professionals.map(professional => 
          professional.id === updatedProfessional.id ? updatedProfessional : professional
        );
        setProfessionals(updatedProfessionals);
      }
      
      toast({
        title: "Profissional atualizado",
        description: `${values.name} foi atualizado com sucesso.`,
      });
      
      setIsEditing(false);
      setEditingProfessional(null);
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      toast({
        title: "Erro ao atualizar profissional",
        description: "Ocorreu um erro ao atualizar o profissional. Tente novamente.",
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Profissionais</CardTitle>
        <CardDescription>
          Gerencie todos os profissionais cadastrados no sistema
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
            placeholder="Buscar profissionais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "Nenhum profissional encontrado com esse termo de busca." : "Nenhum profissional cadastrado."}
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
                    <TableHead onClick={() => handleSort("speciality")} className="cursor-pointer hidden md:table-cell">
                      Especialidade
                      {sortField === "speciality" && (
                        sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead onClick={() => handleSort("email")} className="cursor-pointer hidden md:table-cell">
                      E-mail
                      {sortField === "email" && (
                        sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead onClick={() => handleSort("phone")} className="cursor-pointer text-right">
                      Telefone
                      {sortField === "phone" && (
                        sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProfessionals.map((professional) => (
                    <TableRow key={professional.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: professional.color }}
                          />
                          {professional.name}
                          {!professional.active && (
                            <span className="text-xs bg-gray-200 px-1 rounded ml-1">Inativo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{professional.speciality}</TableCell>
                      <TableCell className="hidden md:table-cell">{professional.email}</TableCell>
                      <TableCell className="text-right">{professional.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEditClick(professional)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(professional.id)}>
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
        
        {/* Diálogo de edição de profissional */}
        <Dialog open={isEditing} onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) setEditingProfessional(null);
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Profissional</DialogTitle>
              <DialogDescription>
                Atualize as informações do profissional abaixo.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateProfessional)} className="space-y-4">
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
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          Profissionais inativos não aparecerão nos agendamentos.
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
                Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.
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
                onClick={deleteProfessional} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir Profissional"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 