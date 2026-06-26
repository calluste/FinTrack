// index.js — CommonJS — returns total balances for linked accounts
const https = require('https');
const {
  DynamoDBClient,
  GetItemCommand,
} = require('@aws-sdk/client-dynamodb');

const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV = 'sandbox',
  PLAID_TOKENS_TABLE = 'PlaidTokens',
} = process.env;

const ddb = new DynamoDBClient({});
const PLAID_HOST =
  PLAID_ENV === 'sandbox' ? 'sandbox.plaid.com' : 'development.plaid.com';

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

exports.handler = async (event) => {
  try {
    // User id comes from JWT: sub
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    //  Get token from DynamoDB
    const { Item } = await ddb.send(
      new GetItemCommand({
        TableName: PLAID_TOKENS_TABLE,
        Key: { userId: { S: userId } },
      })
    );

    if (!Item) {
      return { statusCode: 404, body: 'No bank linked' };
    }

    const access_token = Item.access_token.S;

    //   Call Plaid for balances
    const resp = await plaidPost('/accounts/balance/get', { access_token });

  
    const total = resp.accounts.reduce(
      (sum, acc) => sum + acc.balances.current,
      0
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
      body: JSON.stringify({
        balance: total,
        balanceDate: new Date().toLocaleDateString(),
        accounts: resp.accounts,
      }),
    };
  } catch (err) {
    console.error(err);
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
