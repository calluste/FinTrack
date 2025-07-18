import { useAuth } from "react-oidc-context";

const COGNITO_DOMAIN = import.meta.env.VITE_OIDC_AUTHORITY?.replace(/\/$/, "");
const CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID;
const LOGOUT_REDIRECT = import.meta.env.VITE_OIDC_LOGOUT_REDIRECT || window.location.origin + "/";

function AuthButtons() {
  const auth = useAuth();

  const signOutRedirect = async () => {
    try {
      
      await auth.removeUser();
    } catch (e) {
      console.warn("removeUser error (ignored):", e);
    }
    
    if (!COGNITO_DOMAIN || !CLIENT_ID) {
      console.error("Missing OIDC env vars for logout");
      return;
    }

    const logoutUrl =
      `${COGNITO_DOMAIN}/logout` +
      `?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&logout_uri=${encodeURIComponent(LOGOUT_REDIRECT)}`;

    window.location.href = logoutUrl;
  };

  if (auth.isLoading) {
    return <div>Loading auth…</div>;
  }

  if (auth.error) {
    return <div className="text-red-500 text-sm">Auth error: {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-300">
          {auth.user?.profile.email}
        </span>
        <button
          onClick={signOutRedirect}
          className="px-3 py-1 text-sm rounded bg-zinc-700 hover:bg-zinc-600"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => auth.signinRedirect()}
      className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-500"
    >
      Sign in
    </button>
  );
}

export default AuthButtons;
