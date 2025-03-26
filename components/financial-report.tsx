"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

const monthlyData = [
  {
    name: "Jan",
    receitas: 18000,
    despesas: 12000,
  },
  {
    name: "Fev",
    receitas: 23500,
    despesas: 14500,
  },
  {
    name: "Mar",
    receitas: 29000,
    despesas: 15200,
  },
  {
    name: "Abr",
    receitas: 32000,
    despesas: 16800,
  },
  {
    name: "Mai",
    receitas: 38000,
    despesas: 18500,
  },
  {
    name: "Jun",
    receitas: 42000,
    despesas: 19200,
  },
  {
    name: "Jul",
    receitas: 45231,
    despesas: 20100,
  },
]

export function FinancialReport() {
  const [year, setYear] = useState("2023")

  const currentMonthSummary = {
    receitas: 45231.89,
    despesas: 20100.45,
    lucro: 25131.44,
    margemLucro: 55.56,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Relatório Financeiro</h2>
        <Select defaultValue={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2021">2021</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Julho)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              € {currentMonthSummary.receitas.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Julho)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              € {currentMonthSummary.despesas.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro (Julho)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              € {currentMonthSummary.lucro.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthSummary.margemLucro.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receitas x Despesas ({year})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`€ ${value.toLocaleString("pt-PT")}`, ""]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#10b981" />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

