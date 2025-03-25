# CRM Final

Sistema de gerenciamento de clientes, produtos, serviços, profissionais e agendamentos.

## Tecnologias

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo `.env.local.example` para `.env.local` e configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

4. Configure as variáveis de ambiente no arquivo `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

5. Execute o script de configuração do banco de dados:
```bash
npm run setup
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

7. Acesse o sistema em [http://localhost:3000](http://localhost:3000)

## Funcionalidades

- Gerenciamento de clientes
- Gerenciamento de produtos
- Gerenciamento de serviços
- Gerenciamento de profissionais
- Agendamento de serviços
- Relatórios e estatísticas

## Estrutura do Projeto

```
.
├── app/                    # Páginas e rotas do Next.js
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e configurações
├── public/               # Arquivos estáticos
├── scripts/              # Scripts de configuração
├── styles/              # Estilos globais
└── types/               # Definições de tipos TypeScript
```

## Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter detalhes. 

## Deploy

O projeto está configurado para deploy automático na Vercel. 