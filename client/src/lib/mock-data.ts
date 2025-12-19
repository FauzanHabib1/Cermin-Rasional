import { Transaction } from "./types";
import { subDays, subMonths } from "date-fns";

const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Income - Salary (Consistent)
  transactions.push({
    id: "inc-1",
    date: subDays(now, 2).toISOString(),
    amount: 15000000,
    type: "income",
    category: "savings", // Income doesn't strictly have category in this model, but safe default
    description: "Gaji Bulanan"
  });

  // Needs - Rent, Utilities, Groceries (Consistent)
  transactions.push({
    id: "exp-1",
    date: subDays(now, 15).toISOString(),
    amount: 3500000,
    type: "expense",
    category: "need",
    description: "Sewa Apartemen"
  });
  
  transactions.push({
    id: "exp-2",
    date: subDays(now, 5).toISOString(),
    amount: 800000,
    type: "expense",
    category: "need",
    description: "Listrik & Air"
  });

  // Daily Expenses (Mix of Needs and Wants)
  for (let i = 0; i < 20; i++) {
    const isWant = Math.random() > 0.6; // 40% chance of want
    const amount = isWant ? 50000 + Math.random() * 450000 : 20000 + Math.random() * 100000;
    
    transactions.push({
      id: `txn-${i}`,
      date: subDays(now, Math.floor(Math.random() * 30)).toISOString(),
      amount: Math.round(amount / 1000) * 1000,
      type: "expense",
      category: isWant ? "want" : "need",
      description: isWant ? "Kopi / Hiburan / Jajan" : "Makan Siang / Transport"
    });
  }

  // A big impulse buy to trigger warnings
  transactions.push({
    id: "exp-impulse",
    date: subDays(now, 1).toISOString(),
    amount: 2500000,
    type: "expense",
    category: "want",
    description: "Gadget Baru (Impulsif)"
  });

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_TRANSACTIONS = generateMockTransactions();
