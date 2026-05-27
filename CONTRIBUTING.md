# Guia de Contribuição — NotaZip

## Começando

### Pré-requisitos
- [Bun](https://bun.sh) 1.3.x+
- [PostgreSQL](https://postgresql.org) 16+
- [Redis](https://redis.io) 7+
- [RabbitMQ](https://rabbitmq.com) 3+
- [Docker](https://docker.com) (opcional, para infraestrutura)

### Setup com Docker (recomendado)

```bash
# Iniciar infraestrutura
docker compose -f docs/docker-compose.yml up -d postgres redis rabbitmq

# Clonar e configurar cada serviço
cd nota-zip-<servico>
bun install
bun run db:migrate
bun run dev
```

### Setup Manual

```bash
# Instalar Bun
curl -fsSL https://bun.sh/install | bash

# Instalar dependências do serviço
cd nota-zip-<servico>
bun install

# Configurar banco de dados
export DATABASE_URL=postgresql://nota_zip:changeme@localhost:5432/nota_zip

# Executar migrações
bun run db:migrate

# Iniciar em modo desenvolvimento
bun run dev
```

---

## Estrutura dos Repositórios

Cada microserviço segue a arquitetura hexagonal:

```
src/
├── app/                  # Camada de aplicação
│   ├── operations/       # Casos de uso
│   ├── services/         # Serviços de domínio
│   └── jobs/             # Jobs agendados
├── infra/                # Camada de infraestrutura
│   ├── database/         # Schema, config, migrations
│   ├── cache/            # Redis
│   └── repositories/     # Implementação de repositórios
├── interfaces/           # Camada de interface
│   ├── controllers/      # Controllers HTTP
│   ├── routes/           # Definição de rotas
│   └── schemas/          # Validação Zod
└── index.ts              # Entry point
```

---

## Padrões de Código

### TypeScript
- Strict mode habilitado
- Tipos explícitos (evitar `any`)
- Interfaces para contratos entre camadas
- Zod para validação de entrada

### Banco de Dados
- IDs: UUID gerados pelo PostgreSQL (`uuid().defaultRandom()`)
- Migrations via Drizzle Kit (`bun run db:generate`, `bun run db:migrate`)
- Nunca alterar migrations existentes — criar novas

### Git
- Branches: `feat/`, `fix/`, `docs/`, `chore/`
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- PRs: Sempre contra `main`
- Nunca force push em `main`

---

## Fluxo de Trabalho

1. Crie uma branch a partir de `main`
2. Implemente suas alterações
3. Execute lint e testes: `bun run lint && bun run test`
4. Faça build: `bun run build`
5. Crie um PR com descrição clara
6. Aguarde CI passar e revisão

---

## Testes

```bash
# Executar testes
bun run test

# Executar testes com watch
bun run test --watch
```

---

## Dúvidas

- Abra uma Issue no repositório relevante
- Consulte a documentação em `docs/`
- Consulte a arquitetura em `docs/ARQUITETURA.md`
