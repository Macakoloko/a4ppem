"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface DashboardData {
  totalClients: number
  totalProducts: number
  totalServices: number
  totalProfessionals: number
  totalAppointments: number
  appointmentsToday: number
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData>({
    totalClients: 0,
    totalProducts: 0,
    totalServices: 0,
    totalProfessionals: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const today = new Date().toISOString().split("T")[0]

      const [
        { count: totalClients },
        { count: totalProducts },
        { count: totalServices },
        { count: totalProfessionals },
        { count: totalAppointments },
        { count: appointmentsToday },
      ] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("active", true),
        supabase
          .from("professionals")
          .select("*", { count: "exact", head: true })
          .eq("active", true),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("date", today),
      ])

      setData({
        totalClients: totalClients || 0,
        totalProducts: totalProducts || 0,
        totalServices: totalServices || 0,
        totalProfessionals: totalProfessionals || 0,
        totalAppointments: totalAppointments || 0,
        appointmentsToday: appointmentsToday || 0,
      })
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/clientes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalClients}</div>
              <p className="text-xs text-muted-foreground">clientes ativos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/produtos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalProducts}</div>
              <p className="text-xs text-muted-foreground">produtos ativos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/servicos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalServices}</div>
              <p className="text-xs text-muted-foreground">serviços ativos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profissionais">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalProfessionals}</div>
              <p className="text-xs text-muted-foreground">profissionais ativos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/agendamentos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">agendamentos totais</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/agendamentos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.appointmentsToday}</div>
              <p className="text-xs text-muted-foreground">agendamentos para hoje</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
} 