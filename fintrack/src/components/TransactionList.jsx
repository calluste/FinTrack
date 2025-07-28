import { useDashboardData } from '../utils/useDashboardData';
import ListSkeleton from './skeletons/ListSkeleton';

function TransactionList() {
  const { data, loading } = useDashboardData();
  const transactions = data?.transactions || [];

  if (loading) return <ListSkeleton rows={10} />;
  if (!transactions.length) return <p>No transactions found.</p>;

  return (
    <div className="space-y-2">
      {transactions.map((tx, i) => (
        <div
          key={i}
          className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex justify-between items-center"
        >
          <div>
            <div className="font-semibold">
              {tx.category?.replaceAll('_', ' ') || 'Uncategorized'}
            </div>
            <div className="text-xs text-zinc-500">{tx.date}</div>
          </div>
          <div
            className={`text-sm font-medium ${
              tx.amount < 0 ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;
