import { ClientForm } from "@/components/client-form"
import { ClientList } from "@/components/client-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ClientsPage() {
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="mb-6 text-2xl font-bold">Clientes</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="register">Cadastrar Cliente</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ClientList />
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <ClientForm />
        </TabsContent>
      </Tabs>
    </div>
  )
} 