// utils/apiFetch.js
const API_BASE = "https://cqyuzxk641.execute-api.us-east-1.amazonaws.com";

/**
 * Lightweight wrapper around fetch that automatically adds the
 * Cognito JWT if you pass one in.
 *
 * @param {string} path  - e.g. "/budgets"
 * @param {string} token - access_token from react-oidc-context
 * @param {object} options - normal fetch options
 */
export function apiFetch(path, token, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
