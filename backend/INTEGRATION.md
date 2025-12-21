# Integração Frontend ↔ Backend

Este documento descreve como integrar o backend com o frontend existente.

## 🔌 Endpoints Disponíveis

### Base URL
```
http://localhost:3001/api/v1
```

### 1. Wallet Overview
```typescript
GET /wallet/:address/overview

// Exemplo
fetch('http://localhost:3001/api/v1/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/overview')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 1847,
    "walletAge": 127,
    "activeDays": 89,
    "balance": {
      "native": "1000000000000000000",
      "usdc": "0"
    },
    "score": 2547.7,
    "rank": 95,
    "percentile": 12.5,
    "status": "Excellent",
    "firstSeenAt": "2024-01-01T00:00:00.000Z",
    "lastSeenAt": "2024-05-07T00:00:00.000Z"
  }
}
```

### 2. Network Stats
```typescript
GET /network/stats

fetch('http://localhost:3001/api/v1/network/stats')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 3. Leaderboard
```typescript
GET /network/leaderboard?limit=100&offset=0

fetch('http://localhost:3001/api/v1/network/leaderboard?limit=100')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 4. Wallet Transactions
```typescript
GET /wallet/:address/transactions?limit=100&offset=0

fetch('http://localhost:3001/api/v1/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/transactions')
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🔄 Exemplo de Integração com React

### Hook personalizado

```typescript
// hooks/useWalletData.ts
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function useWalletData(address: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/wallet/${address}/overview`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch wallet data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  return { data, loading, error };
}
```

### Uso no componente

```typescript
// components/metrics-grid.tsx
'use client'

import { useWalletData } from '@/hooks/useWalletData';

export function MetricsGrid({ walletAddress }: { walletAddress: string }) {
  const { data, loading, error } = useWalletData(walletAddress);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <MetricCard
        title="Leaderboard Rank"
        value={`Top ${(100 - (data.percentile || 0)).toFixed(2)}%`}
        subtitle={`Rank #${data.rank}`}
      />
      <MetricCard
        title="Total Transactions"
        value={data.totalTransactions.toLocaleString()}
        subtitle="Since account creation"
      />
      <MetricCard
        title="Active Days"
        value={`${data.activeDays} days`}
        subtitle={`Wallet age: ${data.walletAge} days`}
      />
      {/* ... mais métricas */}
    </div>
  );
}
```

## 🔧 Variáveis de Ambiente

Adicione no `.env.local` do frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 🚀 Próximos Passos

1. Substituir dados mockados nos componentes por chamadas à API
2. Adicionar tratamento de erros adequado
3. Implementar cache/refetch strategy
4. Adicionar loading states
5. Implementar paginação para transações











