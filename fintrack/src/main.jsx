import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import "./index.css";

/* ─── OIDC config pulled from environment ───────────────────────────── */
const AUTHORITY         = import.meta.env.VITE_OIDC_AUTHORITY;          // e.g. https://fintrackdemo1.auth.us-east-1.amazoncognito.com
const CLIENT_ID         = import.meta.env.VITE_OIDC_CLIENT_ID;
const REDIRECT_URI      = import.meta.env.VITE_OIDC_REDIRECT;
const SILENT_REDIRECT   = import.meta.env.VITE_OIDC_SILENT;
const LOGOUT_REDIRECT   = import.meta.env.VITE_OIDC_LOGOUT_REDIRECT;

/**
 * Rather than let the library fetch the discovery document (which was
 * failing with 404/CORS), we embed the Cognito metadata explicitly.
 * This removes the network call entirely.
 */
const cognitoAuthConfig = {
  authority: AUTHORITY,
  client_id: CLIENT_ID,

  redirect_uri: REDIRECT_URI,
  silent_redirect_uri: SILENT_REDIRECT,
  post_logout_redirect_uri: LOGOUT_REDIRECT,

  response_type: "code",
  scope: "openid email profile",

  // static metadata – no discovery fetch required
  metadata: {
    issuer: AUTHORITY,
    authorization_endpoint: `${AUTHORITY}/oauth2/authorize`,
    token_endpoint:         `${AUTHORITY}/oauth2/token`,
    userinfo_endpoint:      `${AUTHORITY}/oauth2/userInfo`,
    jwks_uri:               `${AUTHORITY}/oauth2/jwks`,
    end_session_endpoint:   `${AUTHORITY}/logout`
  },

  automaticSilentRenew: true,
  revokeTokensOnSignout: false
};

/* ───────────────────────────────────────────────────────────────────── */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
