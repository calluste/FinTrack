import { useAuth } from "react-oidc-context";

function Login() {
  const auth = useAuth();

  if (auth.isLoading) return <div>Loading…</div>;
  if (auth.error)   return <div>Authentication error: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    // already signed in go home
    window.location.replace("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">Please sign in</h1>
      {/* big blue buttton */}
      <button
        className="px-6 py-2 bg-blue-600 rounded"
        onClick={() => auth.signinRedirect()}
      >
        Sign In with Cognito
      </button>
    </div>
  );
}

export default Login;
