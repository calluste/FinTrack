import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { apiFetch } from '../utils/apiFetch';
import BalanceCard       from '../components/BalanceCard';
import ChartWidget       from '../components/ChartWidget';
import TransactionList   from '../components/TransactionList';
import CategoryChart     from '../components/CategoryChart';
import AuthButtons       from '../components/AuthButtons';
import ConnectBankButton from '../components/ConnectBankButton';


async function fetchDashboardData(token) {
  // live balances
  let res = await apiFetch('/plaid/summary', token);
  if (res.ok) {
    const json = await res.json();
    return { linked: true, data: json };
  }

  //  404 → no bank linked → demo data
  if (res.status === 404) {
    res = await apiFetch('/budget', token);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { linked: false, data: json };
  }

  //  anything else → bubble up
  throw new Error(`HTTP ${res.status}`);
}

export default function Dashboard() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [linked,  setLinked]  = useState(false);
  const [data,    setData]    = useState(null);

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    setLoading(true);
    fetchDashboardData(auth.user.access_token)
      .then(({ linked, data }) => {
        setLinked(linked);
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [auth.isAuthenticated, auth.user?.access_token]);

  if (loading) return <p>Loading dashboard…</p>;
  if (error)   return <p className="text-red-400">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>
        {linked
          ? 'Live balances loaded'
          : 'Using demo data — link a bank to see live numbers'}
      </p>

      <AuthButtons />
      <ConnectBankButton linked={linked} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard amount={data.balance} date={data.balanceDate} /> 

        {data.chartData && (
          <ChartWidget
            data={data.chartData}
            title="Income vs. Expenses"
          />
        )}

        {data.categoryData && (
          <CategoryChart
            data={data.categoryData}
            title="Spending by Category"
          />
        )}
      </div>

      {data.transactions && (
        <TransactionList transactions={data.transactions} />
      )}
    </div>
  );
}