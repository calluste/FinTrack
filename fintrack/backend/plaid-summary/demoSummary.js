// demoSummary.js
module.exports = function buildSummary(transactions) {
    const byCat = {};
    let totalSpent = 0;
  
    transactions.forEach(t => {
      if (t.type === "debit") {
        totalSpent += t.amount;
        byCat[t.category] = (byCat[t.category] || 0) + t.amount;
      }
    });
  
    return {
      categoryData: Object.entries(byCat).map(([name, value]) => ({ name, value })),
      totalSpent,
      balance: 2345.67 + 5432.10 - 320.45, // demo balance calc (checking + savings - cc)
      balanceDate: new Date().toLocaleDateString()
    };
  };
  