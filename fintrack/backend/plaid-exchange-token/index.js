// index.js  (CommonJS) – swaps Plaid public_token for access_token
const https = require("https");
const {
  DynamoDBClient,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");

const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV = "sandbox",
  PLAID_TOKENS_TABLE = "PlaidTokens",
} = process.env;

const PLAID_HOST =
  PLAID_ENV === "sandbox" ? "sandbox.plaid.com" : "development.plaid.com";

const ddb = new DynamoDBClient({});

// Helper to POST to Plaid
function plaidPost(path, bodyObj) {
  const body = JSON.stringify({
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    ...bodyObj,
  });

  const opts = {
    hostname: PLAID_HOST,
    path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 200) return resolve(json);
          reject(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  try {
    const { public_token, userId } = JSON.parse(event.body || "{}");
    if (!public_token || !userId) {
      return { statusCode: 400, body: "Missing public_token or userId" };
    }

    // 1️⃣ Exchange public_token
    const { access_token } = await plaidPost(
      "/item/public_token/exchange",
      { public_token }
    );

    // 2️⃣ Store access_token in DynamoDB
    await ddb.send(
      new PutItemCommand({
        TableName: PLAID_TOKENS_TABLE,
        Item: {
          userId: { S: userId },
          access_token: { S: access_token },
        },
      })
    );

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
