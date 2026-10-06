import type { PaymentMethod, TransactionType } from "@hinton/shared";

// Fictional data for a young professional living in Hyderabad.
// Dates are relative to "today" so the demo month is always the current month.

export const ACCOUNTS = [
  { name: "Cash", openingBalance: 5000 },
  { name: "HDFC Savings", openingBalance: 40000 },
  { name: "Credit Card", openingBalance: 0 },
];

export const CATEGORIES: { name: string; type: TransactionType }[] = [
  { name: "Food", type: "expense" },
  { name: "Travel", type: "expense" },
  { name: "Fun", type: "expense" },
  { name: "Bills", type: "expense" },
  { name: "Rent", type: "expense" },
  { name: "Shopping", type: "expense" },
  { name: "Salary", type: "income" },
  { name: "Freelance", type: "income" },
];

export const BUDGETS: Record<string, number> = {
  Food: 8000,
  Travel: 3000,
  Fun: 2500,
  Bills: 4000,
  Rent: 18000,
  Shopping: 5000,
};

type Row = [day: number, title: string, amount: number, category: string, account: string, method: PaymentMethod];

// The current month has exactly these Food / Travel / Fun expenses (used in the class demo):
// Biryani 450 + Groceries 1,200 (Food), Metro card 500 (Travel), Movie 300 (Fun).
const THIS_MONTH_EXPENSES: Row[] = [
  [2, "Room rent", 18000, "Rent", "HDFC Savings", "upi"],
  [3, "Biryani", 450, "Food", "Cash", "cash"],
  [4, "Metro card", 500, "Travel", "HDFC Savings", "upi"],
  [4, "Broadband", 799, "Bills", "HDFC Savings", "upi"],
  [5, "Groceries", 1200, "Food", "Credit Card", "card"],
  [5, "Electricity bill", 1150, "Bills", "HDFC Savings", "upi"],
  [6, "Movie", 300, "Fun", "HDFC Savings", "upi"],
  [6, "Running shoes", 2499, "Shopping", "Credit Card", "card"],
];
const THIS_MONTH_INCOME: Row[] = [
  [1, "Salary", 65000, "Salary", "HDFC Savings", "upi"],
  [3, "Logo design project", 8000, "Freelance", "HDFC Savings", "upi"],
];

const LAST_MONTH: Row[] = [
  [1, "Salary", 65000, "Salary", "HDFC Savings", "upi"],
  [2, "Room rent", 18000, "Rent", "HDFC Savings", "upi"],
  [3, "Groceries", 1850, "Food", "Credit Card", "card"],
  [3, "Swiggy dinner", 420, "Food", "HDFC Savings", "upi"],
  [4, "Metro card", 500, "Travel", "HDFC Savings", "upi"],
  [5, "Electricity bill", 1320, "Bills", "HDFC Savings", "upi"],
  [5, "Broadband", 799, "Bills", "HDFC Savings", "upi"],
  [6, "Netflix", 649, "Fun", "Credit Card", "card"],
  [7, "Chai and samosa", 60, "Food", "Cash", "cash"],
  [8, "Zomato lunch", 380, "Food", "HDFC Savings", "upi"],
  [9, "Rapido to office", 140, "Travel", "HDFC Savings", "upi"],
  [10, "Mobile recharge", 399, "Bills", "HDFC Savings", "upi"],
  [11, "Myntra kurta", 1799, "Shopping", "Credit Card", "card"],
  [12, "Biryani", 450, "Food", "Cash", "cash"],
  [13, "Freelance website fix", 12000, "Freelance", "HDFC Savings", "upi"],
  [14, "Movie", 350, "Fun", "HDFC Savings", "upi"],
  [15, "Uber to airport", 780, "Travel", "Credit Card", "card"],
  [16, "Spotify", 119, "Fun", "Credit Card", "card"],
  [17, "Filter coffee", 120, "Food", "Cash", "cash"],
  [18, "Amazon headphones", 2199, "Shopping", "Credit Card", "card"],
  [19, "Swiggy dinner", 510, "Food", "HDFC Savings", "upi"],
  [20, "Gaming cafe", 600, "Fun", "Cash", "cash"],
  [21, "Metro top-up", 300, "Travel", "HDFC Savings", "upi"],
  [22, "Groceries", 1430, "Food", "HDFC Savings", "upi"],
  [23, "Cricket tickets", 900, "Fun", "HDFC Savings", "upi"],
  [24, "Zomato lunch", 340, "Food", "HDFC Savings", "upi"],
  [26, "Water bill", 250, "Bills", "HDFC Savings", "upi"],
  [27, "Birthday dinner", 1650, "Food", "Credit Card", "card"],
];

const TWO_MONTHS_AGO: Row[] = [
  [1, "Salary", 65000, "Salary", "HDFC Savings", "upi"],
  [2, "Room rent", 18000, "Rent", "HDFC Savings", "upi"],
  [4, "Groceries", 1620, "Food", "Credit Card", "card"],
  [6, "Metro card", 500, "Travel", "HDFC Savings", "upi"],
  [7, "Electricity bill", 1480, "Bills", "HDFC Savings", "upi"],
  [9, "Swiggy dinner", 450, "Food", "HDFC Savings", "upi"],
  [12, "Movie", 300, "Fun", "HDFC Savings", "upi"],
  [15, "Freelance logo", 6000, "Freelance", "HDFC Savings", "upi"],
  [18, "Sneakers", 2999, "Shopping", "Credit Card", "card"],
  [22, "Biryani", 430, "Food", "Cash", "cash"],
  [25, "Auto rickshaw", 220, "Travel", "Cash", "cash"],
];

export type SeedTransaction = {
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  account: string;
  paymentMethod: PaymentMethod;
};

function isoDate(year: number, monthIndex: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

/** Builds the seed transactions. Days after "today" are pulled back to today. */
export function buildSeedTransactions(today: Date = new Date()): SeedTransaction[] {
  const year = today.getFullYear();
  const month = today.getMonth();
  const incomeCategories = new Set(CATEGORIES.filter((c) => c.type === "income").map((c) => c.name));

  const toTransactions = (rows: Row[], monthsBack: number): SeedTransaction[] =>
    rows.map(([day, title, amount, category, account, paymentMethod]) => ({
      date: isoDate(year, month - monthsBack, monthsBack === 0 ? Math.min(day, today.getDate()) : day),
      title,
      amount,
      type: incomeCategories.has(category) ? "income" : "expense",
      category,
      account,
      paymentMethod,
    }));

  return [
    ...toTransactions([...THIS_MONTH_INCOME, ...THIS_MONTH_EXPENSES], 0),
    ...toTransactions(LAST_MONTH, 1),
    ...toTransactions(TWO_MONTHS_AGO, 2),
  ];
}
