# Migração do Backend NestJS para API Routes do Next.js

## ✅ Migração Concluída

O backend NestJS foi completamente migrado para API Routes do Next.js. Todas as funcionalidades foram preservadas.

## 📁 Estrutura Criada

### API Routes
- `app/api/v1/wallet/[address]/overview/route.ts` - Overview da carteira
- `app/api/v1/wallet/[address]/transactions/route.ts` - Transações da carteira
- `app/api/v1/network/stats/route.ts` - Estatísticas da rede
- `app/api/v1/network/leaderboard/route.ts` - Leaderboard
- `app/api/v1/indexer/run/route.ts` - Executar indexação manualmente
- `app/api/v1/cron/route.ts` - Endpoint para cron jobs

### Serviços
- `lib/services/rpc.service.ts` - Serviço RPC para interação com blockchain
- `lib/services/metrics.service.ts` - Cálculo de métricas e scores
- `lib/services/indexer.service.ts` - Indexação de blocos e transações

### Configuração
- `lib/prisma.ts` - Cliente Prisma configurado para Next.js
- `prisma/schema.prisma` - Schema do banco de dados (movido da pasta backend)

## 🔧 Configuração Necessária

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="file:./prisma/dev.db"
ARC_RPC_URL="https://rpc.testnet.arc.network"
INDEXER_ENABLED=true
INDEXER_START_BLOCK=0
INDEXER_BATCH_SIZE=100
USDC_CONTRACT_ADDRESS=""
CRON_SECRET=""
```

### 3. Configurar Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Executar o Projeto
```bash
npm run dev
```

## 🔄 Cron Jobs

Os cron jobs podem ser configurados de duas formas:

### Opção 1: Vercel Cron (Recomendado para produção)
Configure no `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/v1/cron?action=indexer",
      "schedule": "*/30 * * * * *"
    },
    {
      "path": "/api/v1/cron?action=metrics",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Opção 2: Serviço Externo
Use um serviço como cron-job.org ou similar para chamar:
- `GET /api/v1/cron?action=indexer` - A cada 30 segundos
- `GET /api/v1/cron?action=metrics` - A cada 5 minutos
- `GET /api/v1/cron?action=network-stats` - A cada 5 minutos

**Importante:** Configure o `CRON_SECRET` e envie no header:
```
Authorization: Bearer <CRON_SECRET>
```

## 📡 Endpoints Disponíveis

### Wallet
- `GET /api/v1/wallet/:address/overview` - Dados completos da carteira
- `GET /api/v1/wallet/:address/transactions?limit=100&offset=0` - Transações da carteira

### Network
- `GET /api/v1/network/stats` - Estatísticas da rede
- `GET /api/v1/network/leaderboard?limit=100&offset=0` - Leaderboard

### Indexer
- `POST /api/v1/indexer/run` - Executar indexação manualmente

### Cron
- `GET /api/v1/cron?action=indexer` - Executar indexação (via cron)
- `GET /api/v1/cron?action=metrics` - Recalcular métricas (via cron)
- `GET /api/v1/cron?action=network-stats` - Atualizar stats da rede (via cron)

## 🔄 Mudanças no Frontend

O arquivo `lib/api.ts` foi atualizado para usar rotas relativas (`/api/v1` em vez de `http://localhost:3001/api/v1`). Não é necessário alterar o código do frontend.

## 🗑️ Backend Antigo

A pasta `backend/` pode ser removida após confirmar que tudo está funcionando. Todos os arquivos foram migrados para a estrutura do Next.js.

## 📝 Notas

- O Prisma agora está configurado na raiz do projeto
- Os serviços são singletons para melhor performance
- As rotas seguem o padrão Next.js App Router
- CORS não é mais necessário (mesmo domínio)
- O indexador pode ser executado manualmente ou via cron

