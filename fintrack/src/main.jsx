import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import "./index.css";

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT,
  silent_redirect_uri: import.meta.env.VITE_OIDC_SILENT,
  post_logout_redirect_uri: import.meta.env.VITE_OIDC_LOGOUT_REDIRECT,
  metadataUrl: import.meta.env.VITE_OIDC_METADATA,
  response_type: "code",
  scope: "openid email profile aws.cognito.signin.user.admin",
  automaticSilentRenew: true,
  revokeTokensOnSignout: false,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
