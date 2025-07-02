function BalanceCard({ amount, date }) {
  return (
    <div className="bg-zinc-900 rounded-2xl shadow p-6 flex flex-col gap-2">
      <span className="text-sm text-zinc-400">Available Balance</span>
      <h2 className="text-4xl font-bold text-white">${amount.toFixed(2)}</h2>
      <span className="text-xs text-zinc-500">As of {date}</span>
    </div>
  );
}

export default BalanceCard;
