import { useAuth } from "react-oidc-context";
import React, { useState } from "react";
import { apiFetch } from "../utils/apiFetch";
import ChangePasswordModal from "../components/ChangePasswordModal";


const COGNITO_DOMAIN = "https://us-east-1ku7q9mz3g.auth.us-east-1.amazoncognito.com";
const LOGOUT_REDIRECT = import.meta.env.VITE_OIDC_LOGOUT_REDIRECT;
const REDIRECT_URI = import.meta.env.VITE_OIDC_REDIRECT;
const AUTHORITY = import.meta.env.VITE_OISC_AUTHORITY;

// helper ▸ pick the most human‑readable name available
function deriveDisplayName(profile = {}) {
  if (profile.name) return profile.name;
  if (profile.given_name || profile.family_name)
    return `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim();
  if (profile.email && profile.email.includes("@"))
    return profile.email.split("@")[0];
  return "User"; // ultimate fallback
}

export default function Settings() {
  const auth     = useAuth();
  const profile  = auth.user?.profile ?? {};
  const email    = profile.email ?? "—";
  const [nameEdit, setNameEdit] = useState(deriveDisplayName(profile));
  const [saving,  setSaving]    = useState(false);
  const [msg,     setMsg]       = useState("");
  const [showPwModal, setShowPwModal] = useState(false);
  

  // ── save handler ──────────────────────────────────────────────────────
  const handleSave = async () => {
    const trimmed = nameEdit.trim();
    if (!trimmed) return;
    setSaving(true);
    setMsg("");
    try {
      const token = auth.user?.access_token;
      const res = await apiFetch("/profile", token, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Optimistically patch local profile so UI updates immediately
      if (auth.user?.profile) auth.user.profile.name = trimmed;

      // Silent token refresh 
      try {
        await auth.signinSilent();
      } catch (_) {/* ignore */}

      setMsg("Saved ✔");
    } catch (err) {
      setMsg(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };


const handleChangePw = () => {
  const redirect =
    import.meta.env.VITE_OIDC_REDIRECT;

  window.location.href =
    `${COGNITO_DOMAIN}/forgotPassword` +
    `?client_id=${auth.settings.client_id}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&redirect_uri=${encodeURIComponent(redirect)}`;
};


  const handleSignOut = () => {
    auth.removeUser().catch(() => {});
    const logoutUrl = 
    '${AUTHORITY}/logout' +
    '?client_id=${auth.settings.client_id}' +
    '&logout_uri=${encodeURIComponent(LOGOUT_REDIRECT)}';
    window.location.href = logoutUrl;
};


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
          <input
            type="text"
            value={nameEdit}
            onChange={(e) => setNameEdit(e.target.value)}
            disabled={saving}
            className="w-full p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
          />
        </div>

        {msg && <p className="text-sm text-zinc-400">{msg}</p>}
      </div>

      <div className="flex gap-4 max-w-md">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <button
          onClick={() => setShowPwModal(true)}
          className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
        >
          Change Password
        </button>
        {showPwModal && (
          <ChangePasswordModal
            token={auth.user?.access_token}
            onClose={() => setShowPwModal(false)}
            />
        )}
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── export avatar util for Navbar ───────────────────────────────────────
export function getUserInitials(profile) {
  const name = deriveDisplayName(profile);
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}
