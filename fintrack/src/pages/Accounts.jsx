import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { apiFetch } from "../utils/apiFetch";

function Accounts() {
  const auth = useAuth();                          // grab the token
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");

  useEffect(() => {
    const token = auth.user?.access_token;         // may be undefined
    if (!token) return;
    setLoading(true);
    apiFetch("/accounts", token)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // normalize to { accountId, name, type, balance, mask }
        const normalized = data.map((a) => ({
          accountId  : a.accountId,
          name       : a.name,
          type       : a.type,
          mask       : a.mask,
          balance    : a.current ?? 0,
          available  : a.available,
        }));
        setAccounts(normalized);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [auth.user?.access_token]);                   // refetch if token refreshes

  if (loading) return <p>Loading accounts…</p>;
  if (error)   return <p className="text-red-400">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Accounts</h1>

      <div className="space-y-4">
        {accounts.map((a) => (
          <div
            key={a.accountId}
            className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex justify-between"
          >
            <div>
              <div className="text-lg font-semibold">{a.name}</div>
              <div className="text-sm text-zinc-400">
                {a.type}{a.mask ? ` •••${a.mask}` : ""}
              </div>
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
