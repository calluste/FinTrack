import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { apiFetch } from './apiFetch';          

export function useDashboardData() {
  const auth = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // wait until user is logged-in and token is present
    if (!auth.isAuthenticated) return;

    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const res  = await apiFetch('/plaid/summary', auth.user.access_token);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const isDemo = res.headers.get('x-demo') === 'true';
        const json = await res.json();
        setData(json);
        setDemo(isDemo);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setData(null);
        setDemo(false);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [auth.isAuthenticated, auth.user?.access_token]);

  return { data, loading, demo };
}
