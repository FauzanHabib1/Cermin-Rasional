import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@/lib/types";

export function useTransactions() {
  const queryClient = useQueryClient();

  // Fetch transactions from API
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  // Add transaction mutation
  const addMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id">) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!res.ok) throw new Error("Failed to add transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updated }: { id: string | number; updated: Partial<Transaction> }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });

  // Wrapper functions that match the original API
  const addTransaction = (transaction: Transaction) => {
    // Remove id from transaction before sending to API
    const { id, ...transactionData } = transaction;
    addMutation.mutate(transactionData as any);
  };

  const deleteTransaction = (id: string) => {
    deleteMutation.mutate(id);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    updateMutation.mutate({ id, updated });
    return { success: true } as const;
  };

  const clearAll = () => {
    // Not implemented for API version
    console.warn("clearAll not implemented for API version");
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    clearAll,
  };
}
