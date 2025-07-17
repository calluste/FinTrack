import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import "./index.css";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Ku7Q9Mz3G",
  client_id: "7adj6vum09s1k28b0hd53kpruc",

  redirect_uri:
    "https://obscure-computing-machine-v6p9x9xgq6r73pgpx-5173.app.github.dev/auth/callback",
  post_logout_redirect_uri:
    "https://obscure-computing-machine-v6p9x9xgq6r73pgpx-5173.app.github.dev/login",

  response_type: "code",
  scope: "openid email profile aws.cognito.signin.user.admin",

  automaticSilentRenew: true,
  silent_redirect_uri:
    window.location.origin + "/oidc-silent-redirect.html",   // ← fixed typo
  revokeTokensOnSignout: false,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
