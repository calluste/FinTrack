// index.js — CommonJS style for Node.js 18/20
module.exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      { id: 1, name: "Checking",  type: "Bank",   balance:  2100.53 },
      { id: 2, name: "Savings",   type: "Bank",   balance: 12000.00 },
      { id: 3, name: "Amex Gold", type: "Credit", balance:  -350.42 },
      { id: 4, name: "Robinhood", type: "Broker", balance:   780.11 }
    ]),
  };
};
