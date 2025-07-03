import { useAuth } from "react-oidc-context";

function AuthButtons() {
  const auth = useAuth();

  const signOutRedirect = async () => {
  await auth.signoutRedirect();
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
