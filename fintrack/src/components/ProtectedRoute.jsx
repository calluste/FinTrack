import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.error) {
      auth.signinRedirect(); // redirect to hosted UI
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error]);

  if (auth.isLoading || (!auth.isAuthenticated && !auth.error)) {
    return <div>Loading or redirecting to sign in...</div>;
  }

  if (auth.error) {
    return <div>Auth error: {auth.error.message}</div>;
  }

  return children;
}

export default ProtectedRoute;
