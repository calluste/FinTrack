// index.js  — GET /budgets
const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const ddb = new DynamoDBClient({});
const { BUDGETS_TABLE = "UserBudgets" } = process.env;

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    const resp = await ddb.send(
      new QueryCommand({
        TableName: BUDGETS_TABLE,
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: { ":u": { S: userId } },
      })
    );

    const items = (resp.Items || []).map((i) => ({
      category     : i.category.S,
      monthlyLimit : Number(i.monthlyLimit.N),
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*",
        "Content-Type"                : "application/json",
      },
      body: JSON.stringify(items),
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
