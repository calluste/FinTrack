import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDemo } from "../components/DemoContext";
import { publicDemoData as d } from "../utils/publicDemoData";

import BalanceCard from "../components/BalanceCard";
import ChartWidget from "../components/ChartWidget";
import CategoryChart from "../components/CategoryChart";
import TransactionList from "../components/TransactionList";

export default function PublicDemo() {
  const { setDemo } = useDemo();

  useEffect(() => {
    setDemo(true);
  }, [setDemo]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold">Public Demo</h1>
        <Link
          to="/login"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Sign in for live data
        </Link>
      </div>

      <p className="text-zinc-300">
        This page shows demo balances, charts, and transactions. Sign in and connect a bank to see live Plaid (sandbox) data.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard amount={d.balance} date={d.balanceDate} />
        <ChartWidget data={d.chartData} title="Income vs. Expenses" />
        <CategoryChart data={d.categoryData} title="Spending by Category" />
      </div>

      <TransactionList transactions={d.transactions} />
    </div>
  );
}
