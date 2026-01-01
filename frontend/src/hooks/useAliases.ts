import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Alias } from '../types';

export function useAliases() {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAliases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAliases();
      setAliases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch aliases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAliases();
  }, []);

  return {
    aliases,
    loading,
    error,
    refresh: fetchAliases,
  };
}
