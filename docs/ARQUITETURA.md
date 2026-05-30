# Arquitetura — NotaZip

## Visão Geral

O NotaZip é uma plataforma de gestão financeira pessoal baseada em microserviços, com integração via WhatsApp para envio de notas fiscais e comprovantes.

```
                    ┌──────────────┐
                    │   Frontend   │ :3000
                    │  (Next.js)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Gateway    │ :3001
                    │  (Elysia)    │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼───────┐ ┌─────▼──────┐ ┌───────▼──────┐
   │   Auth MS    │ │  User MS   │ │ Note Guard   │
   │   :3004      │ │  :3002     │ │    :3011     │
   └──────────────┘ └────────────┘ └───────┬──────┘
                                           │
                                    ┌──────▼───────┐
                                    │   RabbitMQ   │ :5672
                                    └──────┬───────┘
                           ┌───────────────┼───────────────┐
                    ┌──────▼───────┐ ┌─────▼──────┐ ┌──────▼──────┐
                    │ Msg Control  │ │ WhatsApp   │ │   LLM Adp   │
                    │   :3007      │ │  Adp :3006 │ │   :3010     │
                    └──────────────┘ └────────────┘ └─────────────┘
                           │
                    ┌──────▼───────┐              ┌──────────────┐
                    │    Redis     │              │ Notifications│
                    │    :6379     │              │    Adp :3008 │
                    └──────────────┘              └──────────────┘
                                                   │
                                            ┌──────▼───────┐
                                            │ Warranty MS  │
                                            │    :3012     │
                                            └──────────────┘
```

---

## Serviços

### Frontend (nota-zip-frontend) — :3000
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn/UI
- **Responsabilidades:** Interface web, autenticação client-side, relatórios, gráficos
- **Store:** Zustand para estado global

### Gateway (nota-zip-gateway) — :3001
- **Stack:** Elysia (Bun)
- **Responsabilidades:** Roteamento de requisições, autenticação JWT, proxy para microserviços

### User MS (nota-zip-user-ms) — :3002
- **Stack:** Elysia, Drizzle ORM, PostgreSQL
- **Responsabilidades:** CRUD de usuários, planos, subscriptions, promo codes
- **Tabelas:** users, plans, subscriptions, promoCodes

### Auth MS (nota-zip-auth-ms) — :3004
- **Stack:** Elysia, Drizzle ORM, PostgreSQL
- **Responsabilidades:** Login, registro, sessões, JWT, validação de email, WhatsApp code generation
- **Tabelas:** users (referência para sessions)

### Message Control MS (nota-zip-message-control-ms) — :3007
- **Stack:** Elysia, Drizzle ORM, PostgreSQL, Redis
- **Responsabilidades:** Controle de mensagens WhatsApp, rate limiting, processamento de filas
- **Tabelas:** messages, whatsappUserLinks, autoReplies, processingEvents, webhookEvents
- **Redis:** Contadores diários de mensagens por usuário

### WhatsApp Adapter (nota-zip-whatsapp-adp) — :3006
- **Stack:** Elysia, Bun
- **Responsabilidades:** Interface com API WhatsApp, envio/recebimento de mensagens, webhook processing

### LLM Adapter (nota-zip-llm-adp) — :3010
- **Stack:** Elysia
- **Responsabilidades:** Processamento de linguagem natural, extração de dados financeiros, RabbitMQ consumer

### Notifications Adapter (nota-zip-notifications-adp) — :3008
- **Stack:** Elysia, Nodemailer
- **Responsabilidades:** Envio de notificações por email via Locaweb SMTP

### Note Guard MS (nota-zip-note-guard-ms) — :3011
- **Stack:** Elysia, Drizzle ORM, PostgreSQL
- **Responsabilidades:** CRUD de transações, categorias, notas, relatórios financeiros, RabbitMQ consumer
- **Tabelas:** transactions, expenses, categories, notes

### Warranty MS (nota-zip-warranty-ms) — :3012
- **Stack:** Elysia, Drizzle ORM, PostgreSQL
- **Responsabilidades:** CRUD de garantias, armazenamento de documentos, controle de uso de storage
- **Tabelas:** warranties

---

## Infraestrutura

| Componente | Tecnologia | Porta |
|-----------|------------|-------|
| Banco de Dados | PostgreSQL 16 | 5432 |
| Cache | Redis 7 | 6379 |
| Message Broker | RabbitMQ 3 | 5672 (AMQP), 15672 (Management) |

---

## Fluxo de Dados

### Registro e Login
1. Frontend → Gateway → Auth MS (registro/login)
2. Auth MS → User MS (criação de usuário)
3. Auth MS → Frontend (JWT + sessão)

### Envio de Nota por WhatsApp
1. Usuário envia mensagem → WhatsApp API → WhatsApp Adapter
2. WhatsApp Adapter → RabbitMQ (fila de entrada)
3. Message Control MS consome fila → verifica rate limit (Redis)
4. Se dentro do limite: Message Control → LLM Adapter (extração de dados)
5. LLM Adapter → Note Guard MS (salva transação)
6. Note Guard MS → RabbitMQ (fila de resposta)
7. WhatsApp Adapter → responde ao usuário

### Relatórios
1. Frontend → Gateway → Note Guard MS
2. Note Guard MS → consulta transações filtradas
3. Note Guard MS → retorna dados agregados (categorias, mensal, resumo)

---

## Padrões

- **Arquitetura Hexagonal:** Separação em layers (interfaces, app/operations, infra)
- **IDs:** UUID v4 gerado pelo PostgreSQL (`gen_random_uuid()`)
- **Validação:** Zod schemas em todos os endpoints
- **ORM:** Drizzle ORM com migrações automáticas
- **Runtime:** Bun 1.3.x
- **API Framework:** Elysia (Bun-native)

---

## Segurança

- Senhas com hash bcrypt
- JWT para autenticação
- Rate limiting por plano (Redis)
- Validação de UUID em todos os endpoints
- CORS configurado no Gateway
- LGPD compliance (ver docs/POLITICA_PRIVACIDADE.md)
