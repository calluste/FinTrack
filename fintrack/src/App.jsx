import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Accounts from './pages/Accounts';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';



function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />
        <div className="flex flex-col flex-1 ml-64">
          <Navbar />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/accounts" element={<Accounts />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
