import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoyaltySettings } from "@/components/loyalty-settings"
import { TeamList } from "@/components/team-list"
import { GeneralSettings } from "@/components/general-settings"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Configurações</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="loyalty">Fidelidade</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="loyalty">
          <LoyaltySettings />
        </TabsContent>

        <TabsContent value="team">
          <TeamList />
        </TabsContent>
      </Tabs>
    </div>
  )
} 