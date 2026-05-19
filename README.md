# Nota Zip Frontend

Aplicação Next.js para gestão financeira do Nota Zip.

## Tech Stack

- Next.js 16
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Zustand (state management)
- Lucide React (icons)

## Features

- Dashboard com estatísticas financeiras
- Gestão de transações (receitas e despesas)
- Guarda Garantias com upload de arquivos
- Planos de assinatura (Free, Basic, Premium)
- Autenticação com 2FA
- Relatórios financeiros

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: URL do API Gateway

## Docker

```bash
docker build -t nota-zip-frontend .
docker run -p 3000:3000 nota-zip-frontend
```

## Pages

- `/` - Landing page
- `/home` - Dashboard principal
- `/expenses` - Gestão de despesas
- `/reports` - Relatórios
- `/garantias` - Guarda Garantias
- `/plans` - Planos de assinatura

## License

MIT
