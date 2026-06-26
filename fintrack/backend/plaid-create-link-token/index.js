// index.js  (CommonJS)  ─ Plaid Link-token helper
const https = require('https');

const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV = 'sandbox',
} = process.env;

const PLAID_HOST =
  PLAID_ENV === 'sandbox' ? 'sandbox.plaid.com' : 'development.plaid.com';

/** Simple helper to POST to Plaid */
function plaidPost(path, bodyObj) {
  const body = JSON.stringify({
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    ...bodyObj,
  });

  const opts = {
    hostname: PLAID_HOST,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          res.statusCode === 200 ? resolve(json) : reject(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async () => {
  try {
    /** 1️⃣  Ask Plaid for a one-time Link token */
    const resp = await plaidPost('/link/token/create', {
      user: { client_user_id: 'demo-user' },     // any identifier
      client_name: 'FinTrack',
      products: ['auth', 'transactions'],
      language: 'en',
      country_codes: ['US'],
    });

    /** 2️⃣  Return it with CORS headers so the browser can read it */
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
      body: JSON.stringify({ link_token: resp.link_token }),
    };
  } catch (err) {
    console.error('Plaid error:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
      body: JSON.stringify(err),
    };
  }
};
