// index.js  (CommonJS)
module.exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      { id: 1, category: "Food",          limit: 400, spent: 310 },
      { id: 2, category: "Bills",         limit: 600, spent: 520 },
      { id: 3, category: "Entertainment", limit: 200, spent: 190 },
      { id: 4, category: "Travel",        limit: 300, spent:  80 }
    ]),
  };
};
