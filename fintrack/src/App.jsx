import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Accounts from './pages/Accounts';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const auth = useAuth();

  const showLayout = auth.isAuthenticated;

  return (
    <Router>
      <div className={`flex min-h-screen bg-zinc-950 text-white ${!showLayout ? 'justify-center items-center' : ''}`}>
        {showLayout && <Sidebar />}
        <div className={`flex flex-col flex-1 ${showLayout ? 'ml-64' : ''}`}>
          {showLayout && <Navbar />}
          <main className="p-6">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budgets"
                element={
                  <ProtectedRoute>
                    <Budgets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/logout/callback" element={<div>Signed out successfully.</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
