// index.js — /accounts with demo fallback and exposed header
const https = require("https");
const demoData = require("./demoData");
const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const ddb = new DynamoDBClient({});

const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV          = "sandbox",
  PLAID_TOKENS_TABLE = "PlaidTokens",
} = process.env;

const PLAID_HOST =
  PLAID_ENV === "sandbox" ? "sandbox.plaid.com" : "development.plaid.com";

const plaidPost = (path, body) =>
  new Promise((resolve, reject) => {
    const data = JSON.stringify({
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      ...body,
    });

    const req = https.request(
      {
        hostname: PLAID_HOST,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let str = "";
        res.on("data", (d) => (str += d));
        res.on("end", () =>
          res.statusCode === 200
            ? resolve(JSON.parse(str))
            : reject(JSON.parse(str))
        );
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });

function returnDemoAccounts() {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Access-Control-Expose-Headers": "x-demo",
      "x-demo": "true"
    },
    body: JSON.stringify(
      demoData.accounts.map(a => ({
        accountId  : a.id,
        institution: "DemoBank",
        name       : a.name,
        mask       : "0000",
        type       : a.type,
        current    : a.current,
        available  : a.available
      }))
    )
  };
}

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    // Fetch tokens
    const tokResp = await ddb.send(
      new QueryCommand({
        TableName: PLAID_TOKENS_TABLE,
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: { ":u": { S: userId } },
      })
    );

    if (tokResp.Count === 0) {
      return returnDemoAccounts();
    }

    // Call Plaid once per token
    const accountArrays = await Promise.all(
      tokResp.Items.map(async (row) => {
        const { accounts } = await plaidPost("/accounts/balance/get", {
          access_token: row.access_token.S,
        });

        return accounts.map((a) => ({
          accountId  : a.account_id,
          institution: a.name?.split(" ")[0] || a.official_name || "Bank",
          name       : a.official_name || a.name,
          mask       : a.mask,
          type       : a.subtype || a.type,
          current    : a.balances.current ?? 0,
          available  : a.balances.available ?? 0,
        }));
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Expose-Headers": "x-demo"
      },
      body: JSON.stringify(accountArrays.flat()),
    };
  } catch (err) {
    console.error(err);
    try {
      return returnDemoAccounts();
    } catch (_) {}
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
