"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    total: 18000,
  },
  {
    name: "Fev",
    total: 23500,
  },
  {
    name: "Mar",
    total: 29000,
  },
  {
    name: "Abr",
    total: 32000,
  },
  {
    name: "Mai",
    total: 38000,
  },
  {
    name: "Jun",
    total: 42000,
  },
  {
    name: "Jul",
    total: 45231,
  },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => [`€ ${value.toLocaleString("pt-PT")}`, "Receita"]}
          labelFormatter={(label) => `Mês: ${label}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

