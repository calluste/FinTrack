// src/components/ConnectBankButton.jsx
import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from 'react-oidc-context';
import { apiFetch } from '../utils/apiFetch';

/*
 * If `linked` is true (the user already connected a bank),
 * this component renders nothing.
 */
export default function ConnectBankButton({ linked }) {
  const auth = useAuth();
  const [linkToken, setLinkToken] = useState(null);

  //if already linked
  if (linked) return null;

  const userId =
    auth.user?.profile?.sub ?? auth.user?.profile?.email ?? 'demo-user';

  /* fetch link_token once we’re authenticated */
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    async function fetchToken() {
      try {
        const res = await apiFetch(
          '/plaid/create-link-token',
          auth.user?.access_token,
          { method: 'POST' }
        );
        const { link_token } = await res.json();
        setLinkToken(link_token);
      } catch (err) {
        console.error('link-token fetch failed:', err);
      }
    }

    fetchToken();
  }, [auth.isAuthenticated, auth.user?.access_token]);

  /* Plaid Link hook */
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      await apiFetch(
        '/plaid/exchange-token',
        auth.user?.access_token,
        {
          method: 'POST',
          body: JSON.stringify({ public_token, userId }),
          headers: { 'Content-Type': 'application/json' },
        }
      );
      alert('Bank linked!');
      // easiest refresh: reload dashboard to pull new balances
      window.location.reload();
    },
  });

  return (
    <button
      className="bg-blue-600 px-4 py-2 rounded mt-4 disabled:opacity-50"
      onClick={() => open()}
      disabled={!ready || !linkToken}
    >
      Connect a Bank
    </button>
  );
}
