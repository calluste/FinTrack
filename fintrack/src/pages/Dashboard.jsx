// src/pages/Dashboard.jsx
import { useAuth } from 'react-oidc-context';
import { useDashboardData } from '../utils/useDashboardData';
import BalanceCard       from '../components/BalanceCard';
import ChartWidget       from '../components/ChartWidget';
import TransactionList   from '../components/TransactionList';
import CategoryChart     from '../components/CategoryChart';
import AuthButtons       from '../components/AuthButtons';
import ConnectBankButton from '../components/ConnectBankButton';

export default function Dashboard() {
  const auth = useAuth();
  const { data, loading, demo, error } = useDashboardData();

  if (!auth.isAuthenticated) return <p>Authenticating…</p>;
  if (loading) return <p>Loading dashboard…</p>;
  if (error)   return <p className="text-red-400">Error: {error}</p>;
  if (!data)   return <p>No data.</p>;

  return (
    <div className="space-y-6">
      {/*<h1 className="text-2xl font-bold">Dashboard</h1>*/}

      <AuthButtons />
      {/* If demo === true, user does NOT have Plaid linked, so show button */}
      <ConnectBankButton linked={!demo} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard amount={data.balance} date={data.balanceDate} /> 

        {data.chartData && data.chartData.length > 0 && (
          <ChartWidget
            data={data.chartData}
            title="Income vs. Expenses"
          />
        )}

        {data.categoryData && data.categoryData.length > 0 && (
          <CategoryChart
            data={data.categoryData}
            title="Spending by Category"
          />
        )}
      </div>

      {data.transactions && data.transactions.length > 0 && (
        <TransactionList transactions={data.transactions} />
      )}
    </div>
  );
}
