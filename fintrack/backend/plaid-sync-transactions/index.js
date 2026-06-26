// stores 90-day sandbox transactions
const https = require('https');
const {
  DynamoDBClient,
  BatchWriteItemCommand,
  QueryCommand,
} = require('@aws-sdk/client-dynamodb');

const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV = 'sandbox',
  PLAID_TOKENS_TABLE,
  PLAID_TX_TABLE = 'PlaidTransactions',
} = process.env;

const ddb  = new DynamoDBClient({});
const HOST = PLAID_ENV === 'sandbox' ? 'sandbox.plaid.com' : 'development.plaid.com';

function plaid(path, body) {
  const data = JSON.stringify({ client_id: PLAID_CLIENT_ID, secret: PLAID_SECRET, ...body });
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: HOST, path, method: 'POST', headers: { 'Content-Type':'application/json', 'Content-Length':Buffer.byteLength(data) }},
      res => { let str=''; res.on('data',d=>str+=d); res.on('end',()=>res.statusCode===200?resolve(JSON.parse(str)):reject(JSON.parse(str))); }
    );
    req.on('error', reject).end(data);
  });
}

exports.handler = async (event) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub;

  // fetch access_token
  const tx = await ddb.send(new QueryCommand({
    TableName: PLAID_TOKENS_TABLE,
    KeyConditionExpression: 'userId = :u',
    ExpressionAttributeValues: { ':u': { S: userId } },
    Limit: 1,
  }));
  if (tx.Count === 0) return { statusCode: 404, body:'No bank linked' };
  const access_token = tx.Items[0].access_token.S;

  //  pull last 90 days
  const end   = new Date();
  const start = new Date(); start.setDate(end.getDate() - 90);

  const resp = await plaid('/transactions/get', {
    access_token,
    start_date: start.toISOString().slice(0,10),
    end_date  : end.toISOString().slice(0,10),
    options: { count: 500 },        // sandbox limit
  });

  //  batch-write 25 items max / batch
  const batches = [];
  while (resp.transactions.length) batches.push(resp.transactions.splice(0,25));

  for (const batch of batches) {
    const PutRequest = batch.map(t => ({
      PutRequest: {
        Item: {
          userId        : { S: userId },
          transactionId : { S: t.transaction_id },
          amount        : { N: t.amount.toString() },
          date          : { S: t.date },
          category      : { S: t.personal_finance_category.primary || 'Uncategorized' },
          type          : { S: t.amount > 0 ? 'debit' : 'credit' },
        },
      },
    }));
    await ddb.send(new BatchWriteItemCommand({ RequestItems: { [PLAID_TX_TABLE]: PutRequest } }));
  }

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization' },
    body: JSON.stringify({ synced: true, count: batches.flat().length }),
  };
};
