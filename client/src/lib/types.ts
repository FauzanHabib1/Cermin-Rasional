export type TransactionType = "income" | "expense";
export type Category = "need" | "want" | "savings";

export interface Transaction {
  id: string;
  date: string; // ISO String
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  parentIncomeId?: number | null; // Links allocation to source income
  isAllocation?: boolean; // True if this is a savings allocation
}

export interface MonthlyAnalysis {
  period: string;
  totalIncome: number;
  totalExpense: number;
  needExpense: number;
  wantExpense: number;
  savedAmount?: number;
  netSavings: number;
  needRatio: number;
  wantRatio: number;
  savingsRatio: number;
  transactionCount: number;
}

export interface Warning {
  level: "info" | "warning" | "critical";
  message: string;
  implication: string;
}

export interface ScoreCard {
  consistencyScore: number;
  consistencyLabel: string;
  efficiencyScore: number;
  warnings: Warning[];
}

export interface DayData {
  date: string;
  amount: number;
  type: "need" | "want";
}
