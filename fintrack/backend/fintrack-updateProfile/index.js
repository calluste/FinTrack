// index.js — PUT /profile { name }
const {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognito = new CognitoIdentityProviderClient({});
const { USER_POOL_ID } = process.env;

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const { name } = JSON.parse(event.body || "{}");
    if (!name) {
      return { statusCode: 400, body: "Missing name" };
    }

    await cognito.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: userId,
        UserAttributes: [{ Name: "name", Value: name }],
      })
    );

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
