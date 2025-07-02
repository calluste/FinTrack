function Budgets() {
  const budgets = [
    { id: 1, category: 'Food', limit: 400, spent: 310 },
    { id: 2, category: 'Bills', limit: 600, spent: 520 },
    { id: 3, category: 'Entertainment', limit: 200, spent: 190 },
    { id: 4, category: 'Travel', limit: 300, spent: 80 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budgets</h1>

      <div className="space-y-4">
        {budgets.map((b) => {
          const percent = Math.min((b.spent / b.limit) * 100, 100);
          const color =
            percent < 80 ? 'bg-green-500' : percent < 100 ? 'bg-yellow-400' : 'bg-red-500';

          return (
            <div
              key={b.id}
              className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">{b.category}</div>
                <div className="text-sm text-zinc-400">
                  ${b.spent} / ${b.limit}
                </div>
              </div>
              <div className="w-full bg-zinc-700 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Budgets;
