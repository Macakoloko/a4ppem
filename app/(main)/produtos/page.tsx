"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductForm } from "@/components/product-form"
import { ProductList } from "@/components/product-list"

export default function ProductsPage() {
  return (
    <div className="container space-y-6 p-10 pb-16">
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Produtos</TabsTrigger>
          <TabsTrigger value="register">Cadastrar Produto</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <ProductList />
        </TabsContent>
        <TabsContent value="register" className="space-y-4">
          <ProductForm />
        </TabsContent>
      </Tabs>
    </div>
  )
} 