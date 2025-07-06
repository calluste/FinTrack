exports.handler = async (event) => {
  const dummyBudgets = [
    { category: "Rent", amount: 1200 },
    { category: "Groceries", amount: 300 },
    { category: "Entertainment", amount: 100 },
    { category: "Savings", amount: 500 },
  ];

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budgets: dummyBudgets }),
  };
};
