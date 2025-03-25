"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfessionalForm } from "@/components/professional-form"
import { ProfessionalList } from "@/components/professional-list"

export default function ProfessionalsPage() {
  return (
    <div className="container py-6 space-y-6">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista de Profissionais</TabsTrigger>
          <TabsTrigger value="register">Cadastrar Profissional</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <ProfessionalList />
        </TabsContent>
        <TabsContent value="register">
          <ProfessionalForm />
        </TabsContent>
      </Tabs>
    </div>
  )
} 