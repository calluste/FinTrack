import { useEffect, useState } from "react";

const API_BASE = "https://cqyuzxk641.execute-api.us-east-1.amazonaws.com";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/accounts`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading accounts…</p>;
  if (error)   return <p className="text-red-400">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Accounts</h1>

      <div className="space-y-4">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex justify-between"
          >
            <div>
              <div className="text-lg font-semibold">{a.name}</div>
              <div className="text-sm text-zinc-400">{a.type}</div>
            </div>
            <div
              className={`text-lg font-mono ${
                a.balance < 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              {a.balance < 0 ? "-" : ""}${Math.abs(a.balance).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Accounts;
