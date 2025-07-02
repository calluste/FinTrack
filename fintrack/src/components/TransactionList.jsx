function TransactionList() {
  const transactions = [
    {
      id: 1,
      description: 'Groceries',
      amount: -54.32,
      date: 'Jul 1, 2025',
    },
    {
      id: 2,
      description: 'Paycheck',
      amount: 1500.0,
      date: 'Jun 30, 2025',
    },
    {
      id: 3,
      description: 'Spotify',
      amount: -9.99,
      date: 'Jun 29, 2025',
    },
  ];

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex justify-between items-center"
        >
          <div>
            <div className="font-semibold">{tx.description}</div>
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
