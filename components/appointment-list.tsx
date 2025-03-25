"use client"

import { useEffect, useState } from "react"
import { format, isValid, parseISO, addDays, subDays, isToday } from "date-fns"
import { pt } from "date-fns/locale"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Loader2, Search, Trash, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

// Função auxiliar para formatar data
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "Data inválida";
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, "dd/MM/yyyy", { locale: pt }) : "Data inválida";
  } catch {
    return "Data inválida";
  }
};

// Função auxiliar para formatar hora
const formatTime = (timeStr: string | null) => {
  if (!timeStr) return "Horário inválido";
  return timeStr;
};

interface AppointmentListProps {
  initialAppointments: any[]
}

export function AppointmentList({ initialAppointments }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<any[]>(initialAppointments)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "all">("day")
  const [dayAppointments, setDayAppointments] = useState<any[]>([])

  useEffect(() => {
    setAppointments(initialAppointments)
  }, [initialAppointments])

  // Filtrar agendamentos do dia selecionado
  useEffect(() => {
    if (viewMode === "day") {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
      const filtered = appointments.filter(appointment => appointment.date === selectedDateStr)
      
      // Ordenar por horário
      filtered.sort((a, b) => {
        if (a.start_time < b.start_time) return -1
        if (a.start_time > b.start_time) return 1
        return 0
      })
      
      setDayAppointments(filtered)
    }
  }, [selectedDate, appointments, viewMode])

  async function handleDeleteAppointment() {
    if (!deleteAppointmentId) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", deleteAppointmentId)

      if (error) {
        console.error("Erro ao excluir agendamento:", error)
        throw error
      }

      setAppointments(appointments.filter((appointment) => appointment.id !== deleteAppointmentId))
      toast.success("Agendamento excluído com sucesso")
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error)
      toast.error("Erro ao excluir agendamento")
    } finally {
      setLoading(false)
      setDeleteAppointmentId(null)
    }
  }

  // Navegar para o dia anterior
  const goToPreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1))
  }

  // Navegar para o próximo dia
  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1))
  }

  // Navegar para hoje
  const goToToday = () => {
    setSelectedDate(new Date())
  }

  function getStatusClass(status: string) {
    switch (status) {
      case 'scheduled':
        return "bg-yellow-100 text-yellow-800"
      case 'confirmed':
        return "bg-blue-100 text-blue-800"
      case 'completed':
        return "bg-green-100 text-green-800"
      case 'cancelled':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'scheduled':
        return "Agendado"
      case 'confirmed':
        return "Confirmado"
      case 'completed':
        return "Concluído"
      case 'cancelled':
        return "Cancelado"
      default:
        return "Desconhecido"
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    // Se estiver no modo de visualização diária, filtra no useEffect
    if (viewMode === "day") return true;
    
    // Para a visualização completa, aplica o filtro de busca
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      appointment.client?.name?.toLowerCase().includes(searchTermLower) ||
      appointment.professional?.name?.toLowerCase().includes(searchTermLower) ||
      appointment.service?.name?.toLowerCase().includes(searchTermLower) ||
      formatDate(appointment.date).toLowerCase().includes(searchTermLower) ||
      formatTime(appointment.start_time).toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>Gerencie os agendamentos do seu estabelecimento</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: "all" | "day") => setViewMode(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Modo de visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Visualização diária</SelectItem>
                <SelectItem value="all">Todos os agendamentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "day" ? (
          <div className="space-y-4">
            <div className="appointment-date-nav">
              <div className="nav-controls">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToPreviousDay}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToNextDay}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isToday(selectedDate) && (
                  <Button 
                    variant="outline" 
                    onClick={goToToday}
                  >
                    Hoje
                  </Button>
                )}
              </div>
              <div className="date-display">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: pt })}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {dayAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum agendamento</h3>
                    <p className="text-sm text-muted-foreground">
                      Não há agendamentos para {format(selectedDate, "dd 'de' MMMM", { locale: pt })}.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="appointment-card"
                      >
                        <div className="appointment-time-block">
                          <span className="start-time">{appointment.start_time.substring(0, 5)}</span>
                          <span className="time-separator">-</span>
                          <span className="end-time">{appointment.end_time.substring(0, 5)}</span>
                        </div>
                        <div className="appointment-info">
                          <p className="appointment-client">{appointment.client?.name}</p>
                          <p className="appointment-service">{appointment.service?.name}</p>
                          <div className="flex justify-between items-center">
                            <p className="appointment-professional">{appointment.professional?.name}</p>
                            <Badge className={`text-xs ${getStatusClass(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="appointment-actions">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteAppointmentId(appointment.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, profissional, serviço ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Nenhum agendamento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.client?.name || "Cliente não encontrado"}</TableCell>
                          <TableCell>{appointment.professional?.name || "Profissional não encontrado"}</TableCell>
                          <TableCell>{appointment.service?.name || "Serviço não encontrado"}</TableCell>
                          <TableCell>{formatDate(appointment.date)}</TableCell>
                          <TableCell>{formatTime(appointment.start_time.substring(0, 5))} - {formatTime(appointment.end_time.substring(0, 5))}</TableCell>
                          <TableCell>
                            <Badge className={getStatusClass(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteAppointmentId(appointment.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deleteAppointmentId} onOpenChange={() => setDeleteAppointmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointment}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 