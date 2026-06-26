// index.js  —  CommonJS style for Node 18/20
const {
  CognitoIdentityProviderClient,
  ChangePasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognito = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  try {
    const { oldPassword, newPassword } = JSON.parse(event.body || "{}");
    if (!oldPassword || !newPassword) {
      return { statusCode: 400, body: "Both passwords required" };
    }

    // Access‑token forwarded via the Authorization header
    const accessToken =
      event.headers?.authorization?.split(" ")[1] ??
      event.headers?.Authorization?.split(" ")[1];

    await cognito.send(
      new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword,
      })
    );

    return {
      statusCode: 204,
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (err) {
    const known = {
      InvalidPasswordException: 422,
      NotAuthorizedException: 401,
      TooManyRequestsException: 429,
      LimitExceededException: 429,
      UserNotFoundException: 404,
    };
    const status = known[err.name] ?? 500;
    
    console.error(err);
    return {
      statusCode: status,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        code: err.name,
        message: err.message,
      }),
    };
  }
};
