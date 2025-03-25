"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, CreditCard, DollarSign, Users, Calendar, Scissors, TrendingUp } from "lucide-react"
import { RecentExpenses } from "@/components/recent-expenses"
import { MonthlyBirthdays } from "@/components/monthly-birthdays"
import { RevenueChart } from "@/components/revenue-chart"
import { PopularServices } from "@/components/popular-services"
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.email}
          </span>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
          >
            Sair
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€ 45.231,89</div>
                <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            {/* ... rest of your dashboard content ... */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 