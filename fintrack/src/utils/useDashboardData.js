import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { apiFetch } from './apiFetch';          

export function useDashboardData() {
  const auth = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // wait until user is logged-in and token is present
    if (!auth.isAuthenticated) return;

    async function fetchData() {
      setLoading(true);
      try {
        const res  = await apiFetch('/plaid/summary', auth.user.access_token);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [auth.isAuthenticated, auth.user?.access_token]);

  return { data, loading };
}
