import { useAuth } from "react-oidc-context";
import { getUserInitials } from "../pages/Settings";
import { useEffect } from "react";
import { useDemo } from "./DemoContext";
import { apiFetch } from "../utils/apiFetch";

function StatusPill({ state }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border";
  if (state === null) {
    return (
      <span className={`${base} bg-zinc-800 text-zinc-300 border-zinc-700`}>
        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
        Checking…
      </span>
    );
  }
  if (state === true) {
    return (
      <span className={`${base} bg-yellow-500/15 text-yellow-300 border-yellow-500/30`}>
        <span className="h-2 w-2 rounded-full bg-yellow-400" />
        Demo data
      </span>
    );
  }
  return (
    <span className={`${base} bg-green-500/15 text-green-300 border-green-500/30`}>
      <span className="h-2 w-2 rounded-full bg-green-400" />
      Plaid(sandbox) Live
    </span>
  );
}

function Avatar({ initials }) {
  return (
    <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}

export default function Navbar() {
  const auth = useAuth();
  const initials = getUserInitials(auth.user?.profile ?? {});
  const { demo, setDemo } = useDemo();
  
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!auth.isAuthenticated) return;
      if (demo !== null) return; // already known 

      try {
        const res = await apiFetch("/accounts", auth.user.access_token);
        const isDemo = res.headers.get("x-demo") === "true";
        if (!cancelled) setDemo(isDemo);
        // we don't need to parse JSON here
      } catch {
        // leave as null; first successful summary/accounts call will set it
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.user?.access_token, demo, setDemo]);

  return (
    <nav className="w-full h-16 px-6 flex items-center justify-between bg-zinc-900 text-white border-b border-zinc-800">
      <div className="flex items-center gap-3">
        {/*<div className="text-lg font-semibold tracking-tight">FinTrack</div>*/}
        <StatusPill state={demo} />
      </div>
      <Avatar initials={initials} />
    </nav>
  );
}



