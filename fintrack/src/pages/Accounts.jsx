function Accounts() {
  const accounts = [
    {
      id: 1,
      name: 'Checking Account',
      type: 'Checking',
      balance: 2432.55,
      lastTransaction: 'Jul 1 • -$52.31 Starbucks',
    },
    {
      id: 2,
      name: 'Savings Account',
      type: 'Savings',
      balance: 8200.00,
      lastTransaction: 'Jun 28 • +$500 Transfer',
    },
    {
      id: 3,
      name: 'Credit Card',
      type: 'Credit',
      balance: -137.25,
      lastTransaction: 'Jun 30 • -$137.25 Amazon',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Accounts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div
            key={account.id}
            className="bg-zinc-900 rounded-2xl p-5 shadow border border-zinc-800"
          >
            <div className="text-lg font-semibold">{account.name}</div>
            <div className="text-sm text-zinc-400 mb-2">{account.type}</div>
            <div
              className={`text-2xl font-bold ${
                account.balance < 0 ? 'text-red-400' : 'text-green-400'
              }`}
            >
              ${Math.abs(account.balance).toFixed(2)}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              {account.lastTransaction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Accounts;
