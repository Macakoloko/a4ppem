"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Search, Trash2, Phone, Mail, Scissors, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { TeamEditForm } from "@/components/team-edit-form"
import { TeamForm } from "@/components/team-form"

// Sample team data
const teamMembers = [
  {
    id: 1,
    name: "Carla Mendes",
    role: "Cabeleireira",
    phone: "+351 912 345 678",
    email: "carla.mendes@exemplo.pt",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "CM",
    services: ["Corte de Cabelo", "Coloração", "Tratamento Capilar"],
    status: "active",
  },
  {
    id: 2,
    name: "Ricardo Santos",
    role: "Barbeiro",
    phone: "+351 923 456 789",
    email: "ricardo.santos@exemplo.pt",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RS",
    services: ["Corte de Cabelo", "Barba", "Corte e Barba"],
    status: "active",
  },
  {
    id: 3,
    name: "Amanda Oliveira",
    role: "Manicure/Pedicure",
    phone: "+351 934 567 890",
    email: "amanda.oliveira@exemplo.pt",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AO",
    services: ["Manicure", "Pedicure"],
    status: "active",
  },
  {
    id: 4,
    name: "João Ferreira",
    role: "Esteticista",
    phone: "+351 945 678 901",
    email: "joao.ferreira@exemplo.pt",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JF",
    services: ["Limpeza de Pele", "Massagem Facial"],
    status: "inactive",
  },
]

export function TeamList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [teamData, setTeamData] = useState(teamMembers)
  const [memberToEdit, setMemberToEdit] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredMembers = teamData.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (member) => {
    setSelectedMember(member)
    setIsDialogOpen(true)
  }

  const handleEditClick = (member) => {
    setMemberToEdit({ ...member })
    setIsEditDialogOpen(true)
  }

  const handleEditSave = (updatedMember) => {
    setTeamData(teamData.map((member) => (member.id === updatedMember.id ? updatedMember : member)))

    toast({
      title: "Profissional atualizado",
      description: `As informações de ${updatedMember.name} foram atualizadas com sucesso.`,
    })

    setIsEditDialogOpen(false)
    setMemberToEdit(null)
  }

  const handleDeleteClick = (member) => {
    setMemberToDelete(member)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      setTeamData(teamData.filter((member) => member.id !== memberToDelete.id))
      toast({
        title: "Profissional removido",
        description: `${memberToDelete.name} foi removido da equipe.`,
      })
      setIsDeleteDialogOpen(false)
      setMemberToDelete(null)
    }
  }

  const handleAddMember = (newMember) => {
    const newId = Math.max(...teamData.map((member) => member.id), 0) + 1
    const memberWithId = {
      ...newMember,
      id: newId,
      avatar: "/placeholder.svg?height=40&width=40",
      initials: newMember.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    }

    setTeamData([...teamData, memberWithId])

    toast({
      title: "Profissional adicionado",
      description: `${newMember.name} foi adicionado à equipe com sucesso.`,
    })

    setIsAddDialogOpen(false)
  }

  return (
    <>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-6">
          <CardTitle className="text-lg">Profissionais</CardTitle>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="mb-4 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar profissional..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Função</TableHead>
                    <TableHead className="hidden md:table-cell">Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Nenhum profissional encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{member.name}</span>
                              <span className="text-xs text-muted-foreground sm:hidden">{member.role}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{member.role}</TableCell>
                        <TableCell className="hidden md:table-cell">{member.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant={member.status === "active" ? "default" : "outline"}
                            className="whitespace-nowrap"
                          >
                            {member.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                                <Scissors className="mr-2 h-4 w-4" />
                                <span>Ver detalhes</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(member)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(member)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Remover</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Details Dialog */}
      {selectedMember && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Profissional</DialogTitle>
              <DialogDescription>Informações completas sobre o profissional selecionado.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                  <AvatarFallback>{selectedMember.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedMember.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedMember.email}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">Serviços</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.services.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este profissional da equipe? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {memberToDelete && (
            <div className="flex items-center gap-3 py-4">
              <Avatar>
                <AvatarImage src={memberToDelete.avatar} alt={memberToDelete.name} />
                <AvatarFallback>{memberToDelete.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{memberToDelete.name}</p>
                <p className="text-sm text-muted-foreground">{memberToDelete.role}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      {memberToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Profissional</DialogTitle>
              <DialogDescription>
                Atualize as informações do profissional. Clique em salvar quando terminar.
              </DialogDescription>
            </DialogHeader>

            <TeamEditForm member={memberToEdit} onSave={handleEditSave} onCancel={() => setIsEditDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Profissional</DialogTitle>
            <DialogDescription>Preencha as informações do novo profissional.</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <TeamForm onSubmit={handleAddMember} onCancel={() => setIsAddDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

