import { NavLink } from 'react-router-dom';

function Sidebar() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-white font-semibold"
      : "text-zinc-300 hover:text-white";

  return (
    <aside className="w-64 h-screen bg-zinc-900 text-white border-r border-zinc-800 p-6 space-y-6 fixed top-0 left-0">
      <div className="text-2xl font-bold tracking-wide">FinTrack</div>
      <nav className="flex flex-col gap-4">
        <NavLink to="/" className={linkClass}>🏠 Dashboard</NavLink>
        <NavLink to="/accounts" className={linkClass}>💳 Accounts</NavLink>
        <NavLink to="/budgets" className={linkClass}>📊 Budgets</NavLink>
        <NavLink to="/transactions" className={linkClass}>📁 Transactions</NavLink>
        <NavLink to="/settings" className={linkClass}>⚙️ Settings</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
