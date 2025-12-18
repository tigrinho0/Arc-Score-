import { useState, useEffect } from 'react';
import { api, Transaction } from '@/lib/api';

export function useWalletTransactions(address: string | null, limit = 100, offset = 0) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!address) {
      setTransactions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getWalletTransactions(address, limit, offset);
        setTransactions(result.transactions);
        setTotal(result.pagination.total);
        setHasMore(result.pagination.hasMore);
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Failed to fetch transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, limit, offset]);

  return { transactions, total, loading, error, hasMore };
}








