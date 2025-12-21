# 🚀 Quick Start - ARC Score Analytics Backend

## Instalação Rápida

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

**Opção A: PostgreSQL (Recomendado)**
```bash
# Criar banco de dados
createdb arc_score

# Configurar .env
cp env.example .env
# Editar DATABASE_URL no .env
```

**Opção B: SQLite (Desenvolvimento)**
```bash
# No .env, use:
DATABASE_URL="file:./dev.db"
```

### 3. Executar Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Iniciar Servidor
```bash
npm run start:dev
```

O servidor estará disponível em: `http://localhost:3001`

## ✅ Verificar se está funcionando

```bash
# Testar endpoint de stats
curl http://localhost:3001/api/v1/network/stats
```

## 📚 Próximos Passos

1. Leia o [README.md](./README.md) para documentação completa
2. Veja [INTEGRATION.md](./INTEGRATION.md) para integrar com o frontend
3. Consulte [TESTING.md](./TESTING.md) para testes
4. Configure [ENV_SETUP.md](./ENV_SETUP.md) para variáveis de ambiente

## 🎯 Endpoints Principais

- `GET /api/v1/wallet/:address/overview` - Dados da carteira
- `GET /api/v1/network/stats` - Estatísticas da rede
- `GET /api/v1/network/leaderboard` - Ranking de carteiras
- `GET /api/v1/wallet/:address/transactions` - Transações da carteira

## ⚙️ Configurações Importantes

No arquivo `.env`, certifique-se de configurar:

- ✅ `DATABASE_URL` - Conexão com banco de dados
- ✅ `ARC_RPC_URL` - RPC da Arc Testnet
- ✅ `INDEXER_ENABLED=true` - Para ativar indexação automática

## 🔄 Indexação

O indexador roda automaticamente a cada 30 segundos (se `INDEXER_ENABLED=true`).

Ele irá:
1. Buscar novos blocos
2. Indexar transações
3. Calcular métricas (a cada 5 minutos)
4. Atualizar rankings

## 📊 Prisma Studio

Para visualizar os dados no banco:

```bash
npm run prisma:studio
```

Abra `http://localhost:5555` no navegador.











