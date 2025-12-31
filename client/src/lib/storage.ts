import { Transaction } from "./types";
import { userStorage } from "./user-storage";

// Get user-specific storage key
const getStorageKey = (): string => {
  const username = userStorage.getUser();
  if (!username) {
    throw new Error("User not logged in");
  }
  return `ratio_transactions_${username}`;
};

export const storage = {
  getTransactions: (): Transaction[] => {
    try {
      const key = getStorageKey();
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  },

  getAllocationsForIncome: (incomeId: string): Transaction[] => {
    const transactions = storage.getTransactions();
    return transactions.filter(t => t.parentIncomeId?.toString() === incomeId);
  },

  sumAllocationsForIncome: (incomeId: string): number => {
    return storage.getAllocationsForIncome(incomeId).reduce((s, t) => s + t.amount, 0);
  },

  addTransaction: (transaction: Transaction): void => {
    try {
      const key = getStorageKey();
      const transactions = storage.getTransactions();
      transactions.unshift(transaction);
      localStorage.setItem(key, JSON.stringify(transactions));
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  },

  deleteTransaction: (id: string): void => {
    try {
      const key = getStorageKey();
      const transactions = storage.getTransactions();
      const target = transactions.find(t => t.id === id);
      if (!target) return;
      // If deleting an income, also remove allocations tied to it
      let filtered: Transaction[];
      if (target.type === 'income') {
        filtered = transactions.filter(t => t.id !== id && t.parentIncomeId?.toString() !== id);
      } else {
        // normal delete (also removes the allocation only)
        filtered = transactions.filter(t => t.id !== id);
      }
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },

  updateTransaction: (id: string, updated: Partial<Transaction>): void => {
    try {
      const key = getStorageKey();
      const transactions = storage.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index < 0) return;

      const existing = transactions[index];
      // If updating an income amount, ensure it still covers allocations
      if (existing.type === 'income' && typeof updated.amount === 'number') {
        const sumAlloc = storage.sumAllocationsForIncome(id);
        if (updated.amount < sumAlloc) {
          throw new Error(`Jumlah pemasukan terlalu kecil untuk menampung alokasi tabungan (butuh >= Rp ${sumAlloc}).`);
        }
      }

      // If updating an allocation amount, ensure parent income can cover it
      if ((existing.isAllocation || updated.isAllocation) && (typeof updated.amount === 'number')) {
        const parentId = existing.parentIncomeId || updated.parentIncomeId;
        if (parentId) {
          const parent = transactions.find(t => t.id === parentId?.toString() && t.type === 'income');
          if (!parent) throw new Error('Parent income tidak ditemukan untuk alokasi ini.');
          // sum other allocations
          const otherAllocSum = transactions.filter(t => t.parentIncomeId?.toString() === parentId?.toString() && t.id !== id).reduce((s, t) => s + t.amount, 0);
          if (parent.amount < otherAllocSum + (updated.amount as number)) {
            throw new Error(`Alokasi terlalu besar untuk pemasukan terkait (butuh <= Rp ${parent.amount - otherAllocSum}).`);
          }
        }
      }

      transactions[index] = { ...existing, ...updated };
      localStorage.setItem(key, JSON.stringify(transactions));
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  clearAll: (): void => {
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error clearing transactions:", error);
    }
  },
};
