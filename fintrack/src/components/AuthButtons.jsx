import { useAuth } from "react-oidc-context";

function AuthButtons() {
  const auth = useAuth();

  const signOutRedirect = () => {
  // 1. Clear local OIDC state
  auth.removeUser().finally(() => {
    // 2. Kick the browser to Cognito’s logout endpoint
    const logoutUrl =
      "https://us-east-1ku7q9mz3g.auth.us-east-1.amazoncognito.com/logout" +
      "?client_id=7adj6vum09s1k28b0hd53kpruc" +
      "&logout_uri=" +
      encodeURIComponent(
        "https://obscure-computing-machine-v6p9x9xgq6r73pgpx-5173.app.github.dev/login"
      );

    window.location.href = logoutUrl;
  });
};



  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Auth error: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    return (
      <div>
        <p>Hello, {auth.user?.profile.email}</p>
        <button onClick={signOutRedirect}>Sign out</button>
      </div>
    );
  }

  return (
    <button onClick={() => auth.signinRedirect()}>Sign in</button>
  );
}

export default AuthButtons;
