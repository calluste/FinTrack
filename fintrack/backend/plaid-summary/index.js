// index.js — /plaid/summary with demo fallback and exposed header
const https = require('https');
const demoData = require('./demoData');
const buildDemoSummary = require('./demoSummary');
const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDBClient({});

const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV          = 'sandbox',
  PLAID_TOKENS_TABLE = 'PlaidTokens',
  PLAID_TX_TABLE     = 'PlaidTransactions',
} = process.env;

const PLAID_HOST =
  PLAID_ENV === 'sandbox' ? 'sandbox.plaid.com' : 'development.plaid.com';

// ── helpers ──────────────────────────────────────────────────────────────
const titleCase = (str = '') =>
  str.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function plaidPost(path, body) {
  const payload = JSON.stringify({
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    ...body,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: PLAID_HOST,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      res => {
        let str = '';
        res.on('data', d => (str += d));
        res.on('end', () =>
          res.statusCode === 200 ? resolve(JSON.parse(str)) : reject(JSON.parse(str)),
        );
      },
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function buildChartData(transactions) {
  const byMonth = {};
  transactions.forEach(t => {
    const ym = t.date.slice(0, 7); // "YYYY-MM"
    if (!byMonth[ym]) byMonth[ym] = { income: 0, expenses: 0 };
    if (t.type === "credit") {
      byMonth[ym].income += Math.abs(t.amount);
    } else {
      byMonth[ym].expenses += Math.abs(t.amount);
    }
  });

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, v]) => ({
      name: ym.slice(5), // "MM"
      income: v.income,
      expenses: v.expenses,
    }));
}

async function returnDemoResponse() {
  const summary   = buildDemoSummary(demoData.transactions);
  const chartData = buildChartData(demoData.transactions);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Expose-Headers': 'x-demo',
      'x-demo': 'true'
    },
    body: JSON.stringify({
      balance     : summary.balance,
      balanceDate : summary.balanceDate,
      chartData,
      categoryData: summary.categoryData,
      transactions: demoData.transactions.map(t => ({
        ...t,
        amount: t.type === "debit" ? -Math.abs(t.amount) : Math.abs(t.amount)
      }))
    })
  };
}

// ── Lambda entrypoint ────────────────────────────────────────────────────
exports.handler = async event => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    // 1) fetch Plaid access_token
    const tokenResp = await ddb.send(
      new QueryCommand({
        TableName: PLAID_TOKENS_TABLE,
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: { ':u': { S: userId } },
        Limit: 1,
      }),
    );

    // If no Plaid link => demo
    if (tokenResp.Count === 0) {
      return await returnDemoResponse();
    }

    const access_token = tokenResp.Items[0].access_token.S;

    // 2) live balance
    const bal = await plaidPost('/accounts/balance/get', { access_token });
    const totalBalance = bal.accounts.reduce((sum, a) => sum + a.balances.current, 0);

    // 3) fetch cached transactions
    const txResp = await ddb.send(
      new QueryCommand({
        TableName: PLAID_TX_TABLE,
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: { ':u': { S: userId } },
      }),
    );

    // 4) aggregate
    const byMonth = {};
    const byCat   = {};

    txResp.Items.forEach(it => {
      const rawAmt = parseFloat(it.amount.N);
      const type   = it.type?.S || (rawAmt < 0 ? 'credit' : 'debit');

      const signedAmt = type === 'debit' ? -Math.abs(rawAmt) : Math.abs(rawAmt);
      const absAmt    = Math.abs(signedAmt);
      const ym        = it.date.S.slice(0, 7);

      if (!byMonth[ym]) byMonth[ym] = { income: 0, expenses: 0 };
      if (type === 'credit') byMonth[ym].income   += absAmt;
      else                   byMonth[ym].expenses += absAmt;

      const catRaw = it.category?.S || '';
      if (type === 'debit' && !catRaw.startsWith('INCOME') && !catRaw.startsWith('TRANSFER')) {
        const cat = titleCase(catRaw) || 'Uncategorized';
        byCat[cat] = (byCat[cat] || 0) + absAmt;
      }

      it._signedAmt = signedAmt;
    });

    const chartData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, v]) => ({
        name: ym.slice(5),
        income: v.income,
        expenses: v.expenses,
      }));

    const categoryData = Object.entries(byCat)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const transactions = txResp.Items.map(it => ({
      amount: it._signedAmt,
      date  : it.date.S,
      type  : it.type?.S || (it._signedAmt < 0 ? 'debit' : 'credit'),
      category:
        it.personal_finance_category?.primary ||
        titleCase(it.category?.S || '') ||
        'Uncategorized',
    })).sort((a, b) => b.date.localeCompare(a.date));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Expose-Headers': 'x-demo'
      },
      body: JSON.stringify({
        balance     : totalBalance,
        balanceDate : new Date().toLocaleDateString(),
        chartData,
        categoryData,
        transactions,
      }),
    };
  } catch (err) {
    console.error(err);
    try {
      return await returnDemoResponse();
    } catch (_) {}
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
