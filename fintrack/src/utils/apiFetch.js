// utils/apiFetch.js
const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * Lightweight wrapper around fetch that automatically adds the
 * Cognito JWT if you pass one in.
 *
 * @param {string} path  - e.g. "/budgets"
 * @param {string} token - access_token from react-oidc-context
 * @param {object} options - normal fetch options
 */
export function apiFetch(path, token, options = {}) {
  const method = (options.method || "GET").toUpperCase();
   const headers = {
     ...(options.headers || {}),
     ...(token ? { Authorization: `Bearer ${token}` } : {}),
   };
   const finalOpts = { ...options, method, headers };

   if (method === "GET" || method === "HEAD") {
     delete finalOpts.body;
   }
   return fetch(`${API_BASE}${path}`, finalOpts);
 }
