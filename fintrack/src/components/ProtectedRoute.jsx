import { useAuth } from "react-oidc-context";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const auth     = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <div>Loading…</div>;
  }

  if (!auth.isAuthenticated) {
    // User isn’t signed in  send them to /login
    // and remember where they wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
