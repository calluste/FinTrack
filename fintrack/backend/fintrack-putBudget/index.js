// index.js — PUT /budgets
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const ddb = new DynamoDBClient({});
const { BUDGETS_TABLE = "UserBudgets" } = process.env;

module.exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const { category, monthlyLimit } = JSON.parse(event.body || "{}");
    if (!category || typeof monthlyLimit !== "number") {
      return { statusCode: 400, body: "Invalid payload" };
    }

    await ddb.send(new PutItemCommand({
      TableName: BUDGETS_TABLE,
      Item: {
        userId      : { S: userId },
        category    : { S: category },
        monthlyLimit: { N: monthlyLimit.toString() },
      },
    }));

    return {
      statusCode: 204,
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
