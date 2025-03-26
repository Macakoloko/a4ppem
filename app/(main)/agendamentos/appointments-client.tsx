"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentForm } from "@/components/appointment-form"
import { AppointmentList } from "@/components/appointment-list"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface AppointmentsClientProps {
  initialAppointments: any[]
}

export function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("calendar")

  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab && ["list", "calendar", "register"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/agendamentos?tab=${value}`, { scroll: false })
  }

  return (
    <div className="container space-y-6 p-4 sm:p-10 pb-16">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="register">Novo</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendar initialAppointments={initialAppointments} />
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <AppointmentList initialAppointments={initialAppointments} />
        </TabsContent>
        <TabsContent value="register" className="space-y-4">
          <AppointmentForm />
        </TabsContent>
      </Tabs>
    </div>
  )
} 