import { useAuth } from "react-oidc-context";

function Login() {
  const auth = useAuth();

  if (auth.isLoading) return <p>Loading...</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;

  if (auth.isAuthenticated) {
    return (
      <div className="p-8 text-white">
        <h2 className="text-2xl mb-4">Welcome, {auth.user?.profile.email}</h2>
        <button
          onClick={() => auth.removeUser()}
          className="bg-red-600 px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <h2 className="text-2xl mb-4">Please log in</h2>
      <button
        onClick={() => auth.signinRedirect()}
        className="bg-blue-600 px-4 py-2 rounded"
      >
        Sign In with Cognito
      </button>
    </div>
  );
}

export default Login;
