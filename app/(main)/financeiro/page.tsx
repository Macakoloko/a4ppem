"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// Importação dinâmica dos componentes para evitar problemas de hidratação
const IncomeForm = dynamic(() => import('@/components/income-form').then(mod => mod.IncomeForm), {
  loading: () => <Skeleton className="h-[500px] w-full" />
})

const ExpenseForm = dynamic(() => import('@/components/expense-form').then(mod => mod.ExpenseForm), {
  loading: () => <Skeleton className="h-[500px] w-full" />
})

const FinancialReport = dynamic(() => import('@/components/financial-report').then(mod => mod.FinancialReport), {
  loading: () => <Skeleton className="h-[500px] w-full" />
})

export default function FinancialPage() {
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="mb-6 text-2xl font-bold">Financeiro</h1>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Recebimentos</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-6">
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <IncomeForm />
          </Suspense>
        </TabsContent>

        <TabsContent value="expense" className="mt-6">
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <ExpenseForm />
          </Suspense>
        </TabsContent>

        <TabsContent value="report" className="mt-6">
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <FinancialReport />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 