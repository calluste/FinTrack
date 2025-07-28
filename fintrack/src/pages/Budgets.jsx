import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { apiFetch } from "../utils/apiFetch";
import { useToast } from "../components/toast/ToastContext";

export default function Budgets() {
  const auth = useAuth();
  const toast = useToast();
  const [budgets, setBudgets] = useState([]);           
  const [spentByCat, setSpentByCat] = useState({});     
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [editCat, setEditCat] = useState(null);
  const [editLimit, setEditLimit] = useState("");
  const token = auth.user?.access_token;
  //  load budgets + summary
  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [bRes, sRes] = await Promise.all([
        apiFetch("/budgets", token),          
        apiFetch("/plaid/summary", token),    
      ]);
      if (!bRes.ok) throw new Error(`Budgets HTTP ${bRes.status}`);
      if (!sRes.ok) throw new Error(`Summary HTTP ${sRes.status}`);

      // Budgets
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

  // ───── add / update budget (PUT) ────────────────────────────────────────────────
  const saveBudget = async ({ category, limit }) => {
    try {
      const res = await apiFetch("/budgets", token, {
        method: "PUT",
        header: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, monthlyLimit: Number(limit) }),
      });
      if (!res.ok) throw new Error('PUT HTTP ${res.status}');
      await loadData();
      toast.success("Budget saved");
    } catch (err) {
      setError(err.message);
      toast.error('Save failed: ${err.message}');
    }
  };
  
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCat.trim() || !newLimit) return;
    saveBudget({ category: newCat.trim(), limit: newLimit });
    setNewCat("");
    setNewLimit("");
    toast.success("Budget added");
  }

  // ───── delete budget (DELETE) ─────────────────────────────────────────
  const handleDelete = async (category, limit) => {
  
  try {
    const res = await apiFetch(
      `/budgets/${encodeURIComponent(category)}`,
      token,
      { method: "DELETE" }
    );
   if (!res.ok) throw new Error(`DELETE HTTP ${res.status}`);
    
    await loadData();

    //offer UNDO for 5s
    const restore = async () => {
      try {
        const putRes = await apiFetch(
          "/budgets",
          token,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, monthlyLimit: Number(limit) }),
          }
        );
        if (!putRes.ok) throw new Error(`PUT HTTP ${putRes.status}`);
        await loadData();
        toast.success(`Restored "${category}".`);
      } catch (err) {
        setError(err.message);
        toast.error(`Restore failed: ${err.message}`);
      }
    };

    toast.info(`Deleted "${category}".`, {
      actionLabel: "Undo",
      onAction: restore,
      duration: 5000,
    });
  } catch (err) {
    setError(err.message);
    toast.error(`Delete failed: ${err.message}`);
  }
};

  // ───── UI ─────────────────────────────────────────────────────────────
  const startEdit = (category, currentLimit) => {
    setEditCat(category);
    setEditLimit(String(currentLimit));
  };
  const cancelEdit = () => {
    setEditCat(null);
    setEditLimit("");
  };
  const saveEdit = () => {
    if (!editCat) return;
    saveBudget({ category: editCat, limit: editLimit });
    setEditCat(null);
    setEditLimit("");
  };
  
  if (loading) return <p>Loading budgets…</p>;
  if (error)   return <p className="text-red-400">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budgets</h1>
      
      <form
        onSubmit={handleAddSubmit}
        className="flex flex-col sm:flex-row gap-3 max-w-xl bg-zinc-900 p-4 rounded-2xl border border-zinc-800"
        >
          <input
            type="text"
            placeholder="Category"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-800 border border-zinc-700"
            required
            />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Monthly limit"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            className="w-40 p-2 rounded bg-zinc-800 border border-zinc-700"
            required
            />
            <button
            type="submit"
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition"
            >
              Add / Update
              </button>
      </form>

      <div className="space-y-4 max-w-2xl">
        {budgets.map(({ category, limit }) => {
          const spent = spentByCat[category] || 0;
          const percent = limit ? Math.min((spent / limit) * 100, 100) : 0;
          const color =
            percent < 80
              ? "bg-green-500"
              : percent < 100
              ? "bg-yellow-400"
              : "bg-red-500";

          const isEditing = editCat === category;

          return (
            <div
              key={category}
              className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"
            >
              <div className="flex justify-between items-center mb-2">
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editLimit}
                      onChange={(e) => setEditLimit(e.target.value)}
                      className="w-32 p-1 rounded bg-zinc-800 border border-zinc-700 text-sm"
                    />
                    <div className="flex gap-2 text-sm">
                      <button
                        type="button" onClick={saveEdit}
                        className="text-green-400 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        type="button" onClick={cancelEdit}
                        className="text-zinc-400 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-semibold">{category}</div>
                    <div className="text-sm text-zinc-400">
                      ${spent.toFixed(2)} / ${limit.toFixed(2)}
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <>
                  <div className="w-full bg-zinc-700 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-end mt-2 gap-4 text-sm">
                    <button
                      type="button" onClick={() => startEdit(category, limit)}
                      className="text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button" onClick={() => handleDelete(category, limit)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}