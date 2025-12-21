const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface NetworkStats {
  totalWallets: number;
  totalTransactions: string;
  totalActiveWallets: number;
  avgTransactionsPerWallet: number;
  medianTransactionsPerWallet: number;
  lastProcessedBlock: string;
  lastUpdated: string;
}

export interface WalletOverview {
  address: string;
  arcScore: number;
  rank: number | null;
  percentile: number | null;
  totalTransactions: number;
  activeDays: number;
  firstSeenAt: string;
  lastSeenAt: string;
  status: string;
  recentTransactions: any[];
  activityData: any[];
  balance?: {
    native: string;
    usdc: string;
  };
}

export interface Transaction {
  hash: string;
  blockNumber: string;
  from: string;
  to: string | null;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: string;
  status: number;
  isContractCreation: boolean;
  contractAddress: string | null;
}

export interface WalletTransactions {
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`[API] Fetching: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error response (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`[API] Response:`, result);
    
    // Backend returns { success: true, data: {...} }
    if (result.success && result.data) {
      console.log(`[API] Data extracted:`, result.data);
      return result.data as T;
    }
    
    // Fallback: return result directly if not in expected format
    console.warn(`[API] Unexpected response format, returning directly`);
    return result as T;
  } catch (error: any) {
    console.error(`[API] Request failed for ${url}:`, error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Não foi possível conectar ao backend. Verifique se o servidor está rodando em ${API_BASE_URL}`);
    }
    throw error;
  }
}

export const api = {
  async getNetworkStats(): Promise<NetworkStats> {
    return fetchAPI<NetworkStats>('/network/stats');
  },

  async getLeaderboard(limit: number = 100, offset: number = 0) {
    return fetchAPI(`/network/leaderboard?limit=${limit}&offset=${offset}`);
  },

  async getWalletOverview(walletAddress: string): Promise<WalletOverview> {
    return fetchAPI<WalletOverview>(`/wallet/${walletAddress}/overview`);
  },

  async getWalletTransactions(
    walletAddress: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<WalletTransactions> {
    return fetchAPI<WalletTransactions>(
      `/wallet/${walletAddress}/transactions?limit=${limit}&offset=${offset}`
    );
  },
};
