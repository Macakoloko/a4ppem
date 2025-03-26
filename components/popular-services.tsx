"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: "Corte de Cabelo", value: 35 },
  { name: "Coloração", value: 25 },
  { name: "Manicure", value: 20 },
  { name: "Pedicure", value: 15 },
  { name: "Tratamentos", value: 5 },
]

const COLORS = ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981"]

export function PopularServices() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`, "Porcentagem"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

