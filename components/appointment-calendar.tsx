"use client"

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Loader2, Clock, User, Calendar as CalendarIcon, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { format, parseISO, addDays, subDays, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from './ui/badge'

interface AppointmentCalendarProps {
  initialAppointments: any[]
}

export function AppointmentCalendar({ initialAppointments }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<any[]>(initialAppointments)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dayAppointments, setDayAppointments] = useState<any[]>([])
  const router = useRouter()

  // Filtrar agendamentos do dia selecionado
  useEffect(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    const filtered = appointments.filter(appointment => appointment.date === selectedDateStr)
    
    // Ordenar por horário
    filtered.sort((a, b) => {
      if (a.start_time < b.start_time) return -1
      if (a.start_time > b.start_time) return 1
      return 0
    })
    
    setDayAppointments(filtered)
  }, [selectedDate, appointments])

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

  // Transformar os dados de agendamento para o formato esperado pelo FullCalendar
  const events = appointments.map(appointment => ({
    id: appointment.id,
    title: `${appointment.client?.name} - ${appointment.service?.name}`,
    start: `${appointment.date}T${appointment.start_time}`,
    end: `${appointment.date}T${appointment.end_time}`,
    extendedProps: {
      professional: appointment.professional?.name,
      status: appointment.status
    },
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status)
  }))

  function getStatusColor(status: string) {
    switch (status) {
      case 'scheduled':
        return '#FFA500' // Laranja
      case 'confirmed':
        return '#3B82F6' // Azul
      case 'completed':
        return '#10B981' // Verde
      case 'cancelled':
        return '#EF4444' // Vermelho
      default:
        return '#6B7280' // Cinza
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

  function getStatusClass(status: string) {
    switch (status) {
      case 'scheduled':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case 'confirmed':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case 'completed':
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case 'cancelled':
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  function handleDateClick(info: any) {
    setSelectedDate(info.date)
  }

  function handleEventClick(info: any) {
    // No mobile, não abrir detalhes ao clicar no evento
    if (window.innerWidth <= 768) return
    
    const { id } = info.event
    const appointment = appointments.find(a => a.id === id)
    
    if (!appointment) return

    const statusText = getStatusText(appointment.status)

    toast(
      <div className="flex flex-col gap-2">
        <div className="font-medium">Detalhes do Agendamento</div>
        <div><span className="font-medium">Cliente:</span> {appointment.client?.name}</div>
        <div><span className="font-medium">Profissional:</span> {appointment.professional?.name}</div>
        <div><span className="font-medium">Serviço:</span> {appointment.service?.name}</div>
        <div><span className="font-medium">Data:</span> {formatDateForDisplay(appointment.date)}</div>
        <div><span className="font-medium">Horário:</span> {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</div>
        <div><span className="font-medium">Status:</span> {statusText}</div>
        {appointment.notes && (
          <div><span className="font-medium">Observações:</span> {appointment.notes}</div>
        )}
      </div>,
      {
        duration: 5000,
        action: {
          label: "Editar",
          onClick: () => {
            // Futura implementação de edição de agendamento
          }
        }
      }
    )
  }

  // Função para formatar a data no formato brasileiro
  function formatDateForDisplay(dateStr: string) {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Agenda</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus agendamentos de forma visual
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => router.push('/agendamentos?tab=register')}>
          Novo Agendamento
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Calendário à esquerda - ocupa 3/5 em desktop, largura total em mobile */}
          <Card className="md:col-span-3 overflow-hidden">
            <CardHeader className="px-3 py-2 md:px-4 md:py-3 border-b">
              <CardTitle className="text-base md:text-lg">Calendário</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="calendar-container-side">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'today'
                  }}
                  events={events}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  height="auto"
                  locale={ptBrLocale}
                  dayMaxEvents={3}
                  eventDisplay="block"
                  fixedWeekCount={false}
                  showNonCurrentDates={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de agendamentos do dia à direita - ocupa 2/5 em desktop, largura total em mobile */}
          <Card className="md:col-span-2">
            <CardHeader className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={goToPreviousDay}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={goToNextDay}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {!isToday(selectedDate) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={goToToday}
                    >
                      Hoje
                    </Button>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <CardTitle className="text-base md:text-lg">Agendamentos</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="day-appointments">
                {dayAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 md:py-8 px-4 text-center">
                    <CalendarIcon className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50 mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-medium">Nenhum agendamento</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Não há agendamentos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-2 md:p-3 bg-card rounded-lg border shadow-sm"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex flex-col justify-center items-center bg-muted/30 rounded-md h-10 w-14 flex-shrink-0">
                            <span className="text-xs font-medium">{appointment.start_time.substring(0, 5)}</span>
                            <span className="text-[10px] text-muted-foreground">-</span>
                            <span className="text-[10px] text-muted-foreground">{appointment.end_time.substring(0, 5)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{appointment.client?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{appointment.service?.name}</p>
                          </div>
                        </div>
                        <Badge className={`text-xs px-1.5 py-0.5 flex-shrink-0 ${getStatusClass(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

