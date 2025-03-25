import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { AppointmentsClient } from "./appointments-client"

export default async function AppointmentsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, name),
      professional:professionals(id, name),
      service:services(id, name)
    `)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  return <AppointmentsClient initialAppointments={appointments || []} />
} 