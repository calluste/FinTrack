import { useAuth } from "react-oidc-context";
import { getUserInitials } from "../pages/Settings";

function Navbar() {
  const auth = useAuth();
  const initials = getUserInitials(auth.user?.profile ?? {});

  return (
    <nav className="w-full h-16 px-6 flex items-center justify-between bg-zinc-900 text-white border-b border-zinc-800">
      {/*<div className="text-xl font-bold tracking-wide">FinTrack</div>*/}
      <div className="text-lg font-medium text-zinc-300">Dashboard</div>
      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold">
        {initials}
      </div>
    </nav>
  );
}

export default Navbar;
