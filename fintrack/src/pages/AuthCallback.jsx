import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // When tokens are ready, leave /auth/callback
  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, location.state, navigate]);

  if (auth.error) {
    return <div>Auth error: {auth.error.message}</div>;
  }

  return <div>Completing sign-in…</div>;
}

export default AuthCallback;
