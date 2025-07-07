// index.js — CommonJS
module.exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      balance: 4723,
      balanceDate: "July 2, 2025",
      chartData: [
        { name: "Jan", income: 4321, expenses: 2400 },
        { name: "Feb", income: 3000, expenses: 1398 },
        { name: "Mar", income: 9000, expenses: 2800 },
        { name: "Apr", income: 4780, expenses: 2908 },
        { name: "May", income: 9890, expenses: 3200 },
        { name: "Jun", income: 4390, expenses: 2100 }
      ],
      categoryData: [
        { name: "Food",  value: 350 },
        { name: "Bills", value: 600 },
        { name: "Entertainment", value: 120 },
        { name: "Shopping", value: 240 },
        { name: "Travel", value: 90 }
      ],
      transactions: [
        { id: 1, name: "Groceries", date: "Jul 1, 2025", amount: -54.32 },
        { id: 2, name: "Paycheck",  date: "Jun 30, 2025", amount: 1500.0 },
        { id: 3, name: "Spotify",   date: "Jun 29, 2025", amount:  -9.99 }
      ]
    }),
  };
};
