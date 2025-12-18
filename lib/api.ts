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
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Backend returns { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data as T;
    }
    
    // Fallback: return result directly if not in expected format
    return result as T;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
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
