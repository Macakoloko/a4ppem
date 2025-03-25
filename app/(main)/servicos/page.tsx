"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceForm } from "@/components/service-form"
import { ServiceList } from "@/components/service-list"

export default function ServicesPage() {
  return (
    <div className="container py-6 space-y-6">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista de Serviços</TabsTrigger>
          <TabsTrigger value="register">Cadastrar Serviço</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <ServiceList />
        </TabsContent>
        <TabsContent value="register">
          <ServiceForm />
        </TabsContent>
      </Tabs>
    </div>
  )
} 