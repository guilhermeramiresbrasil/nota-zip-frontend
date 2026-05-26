# Guia de Deploy — NotaZip

## Pré-requisitos

- Docker 24+ e Docker Compose v2
- Git
- Mínimo 4GB RAM, 20GB disco
- Domínio configurado (para produção)

---

## 1. Deploy Local (Desenvolvimento)

### 1.1 Clonar repositórios

```bash
mkdir notazip && cd notazip
for repo in auth-ms user-ms note-guard-ms message-control-ms gateway frontend whatsapp-adp ocr-adp llm-adp; do
  git clone https://github.com/guilhermeramiresbrasil/nota-zip-$repo.git
done
```

### 1.2 Configurar variáveis

```bash
cp nota-zip-frontend/docs/.env.example .env
# Editar .env com suas configurações
```

### 1.3 Iniciar serviços

```bash
docker compose -f nota-zip-frontend/docs/docker-compose.yml up -d
```

### 1.4 Executar migrations e seed

```bash
# Migrations (executar em cada serviço backend)
docker compose exec auth-ms bun run db:migrate
docker compose exec user-ms bun run db:migrate
docker compose exec note-guard-ms bun run db:migrate
docker compose exec message-control-ms bun run db:migrate

# Seed de planos
docker compose exec user-ms bun run db:seed
```

### 1.5 Verificar saúde

```bash
curl http://localhost:3001/api/health  # Gateway
curl http://localhost:3004/api/health  # Auth
curl http://localhost:3002/api/users/health  # User
curl http://localhost:3011/api/health  # Note Guard
```

---

## 2. Deploy em Produção

### 2.1 Servidor

Recomendação mínima:
- 2 vCPUs, 4GB RAM
- Ubuntu 22.04 LTS
- Docker + Docker Compose instalados

### 2.2 Configuração Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name notazip.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name notazip.com.br;

    ssl_certificate /etc/letsencrypt/live/notazip.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/notazip.com.br/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

### 2.3 SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d notazip.com.br
```

---

## 3. Backup

### 3.1 Backup manual

```bash
# Banco de dados
docker compose exec postgres pg_dump -U nota_zip nota_zip > backup_$(date +%Y%m%d_%H%M%S).sql

# Redis
docker compose exec redis redis-cli BGSAVE
docker cp $(docker compose ps -q redis):/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

### 3.2 Backup automático (cron)

```bash
# Adicionar ao crontab (crontab -e)
0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/notazip-backup.log 2>&1
```

---

## 4. Monitoramento

### 4.1 Verificar logs

```bash
# Todos os serviços
docker compose logs -f

# Serviço específico
docker compose logs -f gateway
docker compose logs -f note-guard-ms
```

### 4.2 Health checks

```bash
# Script de monitoramento
for port in 3001 3002 3004 3005 3006 3011; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/api/health)
  echo "Port $port: $status"
done
```

---

## 5. Troubleshooting

### Serviço não inicia
```bash
docker compose logs <servico>  # Verificar logs
docker compose restart <servico>  # Reiniciar
```

### Banco de dados inacessível
```bash
docker compose exec postgres pg_isready -U nota_zip
docker compose restart postgres
```

### Redis sem conexão
```bash
docker compose exec redis redis-cli ping
docker compose restart redis
```

### RabbitMQ sem conexão
```bash
# Acessar management UI em http://localhost:15672
# Login: guest / guest
docker compose restart rabbitmq
```

---

## 6. Rollback

### 6.1 Reverter para versão anterior

```bash
# Parar serviços
docker compose down

# Reverter código
cd nota-zip-<servico>
git checkout <commit-anterior>

# Reconstruir e iniciar
docker compose build <servico>
docker compose up -d <servico>
```

### 6.2 Restaurar banco de dados

```bash
# Parar serviços (exceto postgres)
docker compose stop auth-ms user-ms note-guard-ms message-control-ms

# Restaurar backup
cat backup_YYYYMMDD_HHMMSS.sql | docker compose exec -T postgres psql -U nota_zip nota_zip

# Reiniciar serviços
docker compose start auth-ms user-ms note-guard-ms message-control-ms
```

---

## 7. Atualizações

```bash
# Atualizar código
cd nota-zip-<servico>
git pull origin main

# Reconstruir imagem
docker compose build <servico>

# Reiniciar com zero-downtime (se possível)
docker compose up -d --no-deps <servico>

# Executar migrations (se houver)
docker compose exec <servico> bun run db:migrate
```
