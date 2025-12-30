import { useState, useEffect, useCallback } from "react";
import { Transaction } from "@/lib/types";
import { storage } from "@/lib/storage";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = storage.getTransactions();
    setTransactions(data);
    setIsLoading(false);
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    storage.addTransaction(transaction);
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    storage.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTransaction = useCallback((id: string, updated: Partial<Transaction>) => {
    try {
      storage.updateTransaction(id, updated);
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...updated } : t)
      );
      return { success: true } as const;
    } catch (e: any) {
      console.error(e);
      return { success: false, message: e?.message || String(e) } as const;
    }
  }, []);

  const clearAll = useCallback(() => {
    storage.clearAll();
    setTransactions([]);
  }, []);

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    clearAll,
  };
}
