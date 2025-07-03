import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import './index.css';

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Ku7Q9Mz3G",
  client_id: "7adj6vum09s1k28b0hd53kpruc",

  // a dedicated callback route
  redirect_uri:
    "https://obscure-computing-machine-v6p9x9xgq6r73pgpx-5173.app.github.dev/auth/callback",

  //  After logout, always land on /login
  post_logout_redirect_uri:
    "https://obscure-computing-machine-v6p9x9xgq6r73pgpx-5173.app.github.dev/login",

  response_type: "code",
  scope: "openid email phone",

  automaticSilentRenew: false,
  revokeTokensOnSignout: true,
};


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
