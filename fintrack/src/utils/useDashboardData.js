import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { apiFetch } from './apiFetch';     
import { useDemo } from '../components/DemoContext';     

export function useDashboardData() {
  const auth = useAuth();
  const { setDemo } = useDemo();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemoLocal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // wait until user is logged-in and token is present
    if (!auth.isAuthenticated) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const res  = await apiFetch('/plaid/summary', auth.user.access_token);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const isDemo = res.headers.get('x-demo') === 'true';
        const json = await res.json();

        if (cancelled) return;
        setData(json);
        setDemoLocal(isDemo);
        setDemo(isDemo);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch dashboard data:', err);
        setData(null);
        setDemoLocal(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.user?.access_token]);

  return { data, loading, demo, error };
}
