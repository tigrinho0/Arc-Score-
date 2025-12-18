import { useState, useEffect } from 'react';
import { api, NetworkStats } from '@/lib/api';

export function useNetworkStats() {
  const [data, setData] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getNetworkStats();
        setData(result);
      } catch (err: any) {
        console.error('Error fetching network stats:', err);
        setError(err.message || 'Failed to fetch network stats');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}








