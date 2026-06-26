// index.js — DELETE /budgets
const { DynamoDBClient, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const ddb = new DynamoDBClient({});
const { BUDGETS_TABLE = "UserBudgets" } = process.env;

module.exports.handler = async (event) => {
  try {
    const userId   = event.requestContext.authorizer.jwt.claims.sub;
    const category = decodeURIComponent(event.pathParameters.category);

    await ddb.send(new DeleteItemCommand({
      TableName: BUDGETS_TABLE,
      Key: {
        userId   : { S: userId },
        category : { S: category },
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
