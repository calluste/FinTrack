import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard     from "./pages/Dashboard";
import Budgets       from "./pages/Budgets";
import Transactions  from "./pages/Transactions";
import Settings      from "./pages/Settings";
import Accounts      from "./pages/Accounts";
import Login         from "./pages/Login";
import AuthCallback  from "./pages/AuthCallback";

function App() {
  const auth       = useAuth();
  const showLayout = auth.isAuthenticated;

  return (
    <Router>
      <div
        className={`flex min-h-screen bg-zinc-950 text-white ${
          showLayout ? "" : "items-center justify-center"
        }`}
      >
        {showLayout && <Sidebar />}

        <div className={`flex flex-col flex-1 ${showLayout ? "ml-64" : ""}`}>
          {showLayout && <Navbar />}

          <main className="p-6">
            <Routes>
              {/* Public */}
              <Route path="/login"          element={<Login />} />
              <Route path="/auth/callback"  element={<AuthCallback />} />

              {/* Protected */}
              <Route path="/"               element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/budgets"        element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
              <Route path="/transactions"   element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/settings"       element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/accounts"       element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
