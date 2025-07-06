import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { apiFetch } from "../utils/apiFetch";

import BalanceCard     from "../components/BalanceCard";
import ChartWidget     from "../components/ChartWidget";
import TransactionList from "../components/TransactionList";
import CategoryChart   from "../components/CategoryChart";
import AuthButtons     from "../components/AuthButtons";

function Dashboard() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [data,    setData]    = useState(null);

  useEffect(() => {
    const token = auth.user?.access_token;
    apiFetch("/budget", token)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [auth.user?.access_token]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error)   return <p className="text-red-400">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Lambda says: Live data loaded</p>
      <AuthButtons />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard  amount={data.balance}      date={data.balanceDate} />
        <ChartWidget  data={data.chartData}      title="Income vs. Expenses" />
        <CategoryChart data={data.categoryData} title="Spending by Category" />
      </div>

      <TransactionList transactions={data.transactions} />
    </div>
  );
}

export default Dashboard;
