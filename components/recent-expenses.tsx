import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const expenses = [
  {
    id: 1,
    description: "Produtos para cabelo",
    amount: "€ 1.250,00",
    date: "22/07/2023",
    category: "Stock",
    icon: "P",
  },
  {
    id: 2,
    description: "Renda do espaço",
    amount: "€ 3.500,00",
    date: "20/07/2023",
    category: "Fixo",
    icon: "R",
  },
  {
    id: 3,
    description: "Conta de energia",
    amount: "€ 450,00",
    date: "18/07/2023",
    category: "Utilidades",
    icon: "E",
  },
  {
    id: 4,
    description: "Material de limpeza",
    amount: "€ 320,00",
    date: "15/07/2023",
    category: "Manutenção",
    icon: "M",
  },
  {
    id: 5,
    description: "Pagamento funcionários",
    amount: "€ 6.500,00",
    date: "10/07/2023",
    category: "Pessoal",
    icon: "F",
  },
]

export function RecentExpenses() {
  return (
    <div className="space-y-8">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center">
          <Avatar className="h-9 w-9 bg-primary/10">
            <AvatarFallback className="text-primary">{expense.icon}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{expense.description}</p>
            <p className="text-sm text-muted-foreground">
              {expense.date} • {expense.category}
            </p>
          </div>
          <div className="ml-auto font-medium">{expense.amount}</div>
        </div>
      ))}
    </div>
  )
}

