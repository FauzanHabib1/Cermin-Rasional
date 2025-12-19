import { Transaction } from "./types";

const STORAGE_KEY = "ratio_transactions";

export const storage = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addTransaction: (transaction: Transaction): void => {
    const transactions = storage.getTransactions();
    transactions.unshift(transaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  },

  deleteTransaction: (id: string): void => {
    const transactions = storage.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  updateTransaction: (id: string, updated: Partial<Transaction>): void => {
    const transactions = storage.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index >= 0) {
      transactions[index] = { ...transactions[index], ...updated };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  },

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
