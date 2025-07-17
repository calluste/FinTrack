import { useState } from "react";
import { apiFetch } from "../utils/apiFetch";

export default function ChangePasswordModal({ token, onClose }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPw !== confirm) return setMsg("Passwords do not match");
    setSaving(true);
    try {
      const res = await apiFetch("/change-password", token, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMsg("Password updated ✔");
      setTimeout(onClose, 1500);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 w-80 space-y-4"
      >
        <h2 className="text-lg font-semibold">Change Password</h2>

        <input
          type="password"
          placeholder="Current password"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New password"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {msg && <p className="text-sm text-zinc-400">{msg}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1 rounded bg-green-600 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
