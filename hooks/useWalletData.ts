import { useState, useEffect } from 'react';
import { api, WalletOverview } from '@/lib/api';

export function useWalletData(address: string | null) {
  const [data, setData] = useState<WalletOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching wallet data for address:', address);
        const result = await api.getWalletOverview(address);
        console.log('Wallet data received:', result);
        console.log('ArcScore:', result?.arcScore);
        console.log('Balance:', result?.balance);
        console.log('USDC Balance (raw):', result?.balance?.usdc);
        
        // Ensure arcScore is a number
        if (result) {
          result.arcScore = typeof result.arcScore === 'number' ? result.arcScore : parseFloat(result.arcScore as any) || 0;
        }
        
        setData(result);
      } catch (err: any) {
        console.error('Error fetching wallet data:', err);
        setError(err.message || 'Failed to fetch wallet data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  return { data, loading, error };
}
