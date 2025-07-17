import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { apiFetch } from "../utils/apiFetch";

export default function Budgets() {
  const auth = useAuth();
  const [budgets, setBudgets] = useState([]);           
  const [spentByCat, setSpentByCat] = useState({});     
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ───── load budgets + summary ──────────────────────────────────────────
  const loadData = async () => {
    const token = auth.user?.access_token;
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [bRes, sRes] = await Promise.all([
        apiFetch("/budgets", token),          // ← GET /prod/budgets → fintrack‑getBudgets Lambda
        apiFetch("/plaid/summary", token),    // ← live spend per category
      ]);
      if (!bRes.ok) throw new Error(`Budgets HTTP ${bRes.status}`);
      if (!sRes.ok) throw new Error(`Summary HTTP ${sRes.status}`);

      // shape: [{ category, monthlyLimit }]
      const budgetsData = await bRes.json();
      setBudgets(
        budgetsData.map(({ category, monthlyLimit }) => ({
          category,
          limit: monthlyLimit,
        }))
      );

      // shape: { categoryData: [{ name, value }] }
      const summaryData = await sRes.json();
      const spendMap = {};
      (summaryData.categoryData || []).forEach(({ name, value }) => {
        spendMap[name] = value;
      });
      setSpentByCat(spendMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [auth.user?.access_token]);

  // ───── add budget (PUT) ────────────────────────────────────────────────
  const handleAdd = async () => {
    const cat = prompt("Category name:");
    if (!cat) return;
    const lim = parseFloat(prompt("Monthly limit (number):"));
    if (Number.isNaN(lim)) return;

    try {
      const token = auth.user?.access_token;
      const res = await apiFetch("/budgets", token, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, monthlyLimit: lim }),
      });
      if (!res.ok) throw new Error(`PUT HTTP ${res.status}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ───── delete budget (DELETE) ─────────────────────────────────────────
  const handleDelete = async (category) => {
    if (!confirm(`Delete budget for "${category}"?`)) return;
    try {
      const token = auth.user?.access_token;
      const res = await apiFetch(`/budgets/${encodeURIComponent(category)}`, token, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`DELETE HTTP ${res.status}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ───── UI ─────────────────────────────────────────────────────────────
  if (loading) return <p>Loading budgets…</p>;
  if (error)   return <p className="text-red-400">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budgets</h1>
      <button onClick={handleAdd} className="btn-primary">Add Budget</button>

      <div className="space-y-4">
        {budgets.map(({ category, limit }) => {
          const spent   = spentByCat[category] || 0;
          const percent = Math.min((spent / limit) * 100, 100);
          const color   = percent < 80 ? "bg-green-500" : percent < 100 ? "bg-yellow-400" : "bg-red-500";

          return (
            <div key={category} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">{category}</div>
                <div className="text-sm text-zinc-400">${spent.toFixed(2)} / ${limit.toFixed(2)}</div>
              </div>
              <div className="w-full bg-zinc-700 h-3 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={() => handleDelete(category)} className="text-red-400">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
