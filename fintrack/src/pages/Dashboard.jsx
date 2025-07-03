import BalanceCard from '../components/BalanceCard';
import ChartWidget from '../components/ChartWidget';
import TransactionList from '../components/TransactionList';
import CategoryChart from '../components/CategoryChart';
import AuthButtons from '../components/AuthButtons';



function Dashboard() {
  const chartData = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 5000, expenses: 2800 },
    { name: 'Apr', income: 4780, expenses: 2908 },
    { name: 'May', income: 5890, expenses: 3200 },
    { name: 'Jun', income: 4390, expenses: 2100 },
  ];

  const transactions = [
    { id: 1, name: "Starbucks", date: "Jul 1", amount: -5.25 },
    { id: 2, name: "Spotify Subscription", date: "Jun 30", amount: -9.99 },
    { id: 3, name: "Freelance Payment", date: "Jun 29", amount: 600.00 },
    { id: 4, name: "Amazon", date: "Jun 28", amount: -35.49 },
    { id: 5, name: "ATM Deposit", date: "Jun 27", amount: 200.00 },
  ];

  const categoryData = [
    { name: 'Food', value: 350 },
    { name: 'Bills', value: 600 },
    { name: 'Entertainment', value: 120 },
    { name: 'Shopping', value: 240 },
    { name: 'Travel', value: 90 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <AuthButtons />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard amount={4723} date="July 2, 2025" />
        <ChartWidget data={chartData} title="Income vs. Expenses" />
        <CategoryChart data={categoryData} title="Spending by Category" />
      </div>

      <TransactionList transactions={transactions} />
    </div>
  );
}

export default Dashboard;
