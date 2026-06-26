// demoData.js
module.exports = {
    accounts: [
      { id: "acc_checking", name: "Checking",  type: "depository", current: 2345.67, available: 2345.67 },
      { id: "acc_savings",  name: "Savings",   type: "depository", current: 5432.10, available: 5432.10 },
      { id: "acc_cc",       name: "Visa Card", type: "credit",     current: -320.45, available: -320.45 }
    ],
    transactions: [
        // Add more credits & debits across months:
      { id:"pay2",  date:"2025-06-01", name:"ACME Payroll", amount:2500.00, category:"Income",        type:"credit" },
      { id:"t11",   date:"2025-06-02", name:"Target",       amount:195.23,   category:"Groceries",     type:"debit"  },
      { id:"t12",   date:"2025-06-05", name:"Chick-fil-A",  amount:14.90,   category:"Restaurants",   type:"debit"  },
      { id:"t13",   date:"2025-06-09", name:"Hulu",         amount:14.99,   category:"Subscriptions", type:"debit"  },
      { id:"t14",   date:"2025-06-14", name:"Chevron",      amount:38.11,   category:"Transport",     type:"debit"  },
      { id:"t15",   date:"2025-06-18", name:"AMC",          amount:22.00,   category:"Entertainment", type:"debit"  },
      { id:"pay3",  date:"2025-05-01", name:"ACME Payroll", amount:2500.00, category:"Income",        type:"credit" },
      { id:"t16",   date:"2025-05-03", name:"Walmart",      amount:180.00,  category:"Groceries",     type:"debit"  },
      { id:"t17",   date:"2025-05-06", name:"DoorDash",     amount:28.30,   category:"Restaurants",   type:"debit"  },
      { id:"t18",   date:"2025-05-11", name:"Paramount+",   amount:9.99,    category:"Subscriptions", type:"debit"  },
      { id:"t19",   date:"2025-05-15", name:"Lyft",         amount:26.70,   category:"Transport",     type:"debit"  },
      { id:"t20",   date:"2025-05-20", name:"Steam",        amount:32.00,   category:"Entertainment", type:"debit"  },    
      { id:"pay1", date:"2025-07-01", name:"ACME Payroll", amount:2500.00, category:"Income", type:"credit" },
      { id:"t1",  date:"2025-07-01", name:"Publix",    amount:182.34,  category:"Groceries",     type:"debit"  },
      { id:"t2",  date:"2025-07-02", name:"Chipotle",  amount:13.56,  category:"Restaurants",   type:"debit"  },
      { id:"t3",  date:"2025-07-03", name:"Shell Gas", amount:42.10,  category:"Transport",     type:"debit"  },
      { id:"t4",  date:"2025-07-04", name:"Netflix",   amount:17.99,  category:"Subscriptions", type:"debit"  },
      { id:"t5",  date:"2025-07-05", name:"AMC",       amount:25.00,  category:"Entertainment", type:"debit"  },
      { id:"t6",  date:"2025-07-06", name:"Walmart",   amount:128.00, category:"Groceries",     type:"debit"  },
      { id:"t7",  date:"2025-07-07", name:"Uber Eats", amount:28.72,  category:"Restaurants",   type:"debit"  },
      { id:"t8",  date:"2025-07-08", name:"Spotify",   amount:9.99,   category:"Subscriptions", type:"debit"  },
      { id:"t9",  date:"2025-07-09", name:"Lyft",      amount:28.40,  category:"Transport",     type:"debit"  },
      { id:"t10", date:"2025-07-10", name:"Steam",     amount:45.00,  category:"Entertainment", type:"debit"  }
    ]
  };
  