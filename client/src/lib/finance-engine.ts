import { Transaction, MonthlyAnalysis, ScoreCard, Warning, DayData } from "./types";
import { startOfMonth, endOfMonth, isWithinInterval, getWeek, subMonths, format } from "date-fns";

// Rational Constants
const TARGET_NEEDS = 50;
const TARGET_WANTS = 30;
const TARGET_SAVINGS = 20;

export const analyzeFinances = (transactions: Transaction[], currentDate: Date = new Date()): MonthlyAnalysis => {
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);

  // Filter current month transactions
  const monthlyTransactions = transactions.filter(t => 
    isWithinInterval(new Date(t.date), { start: currentMonthStart, end: currentMonthEnd })
  );

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions.filter(t => t.type === 'expense');
  
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const needExpense = expenses
    .filter(t => t.category === 'need')
    .reduce((sum, t) => sum + t.amount, 0);

  const wantExpense = expenses
    .filter(t => t.category === 'want')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Ratios (Default to 0 if no income to avoid NaN)
  const needRatio = totalIncome ? (needExpense / totalIncome) * 100 : 0;
  const wantRatio = totalIncome ? (wantExpense / totalIncome) * 100 : 0;
  const savingsRatio = totalIncome ? (netSavings / totalIncome) * 100 : 0;

  return {
    period: format(currentDate, "MMMM yyyy"),
    totalIncome,
    totalExpense,
    needExpense,
    wantExpense,
    netSavings,
    needRatio,
    wantRatio,
    savingsRatio,
    transactionCount: monthlyTransactions.length
  };
};

export const calculateConsistencyScore = (transactions: Transaction[]): ScoreCard => {
  // Logic: Calculate weekly spending variance
  // Group by week
  const weeklySpending: Record<string, number> = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const week = getWeek(new Date(t.date));
      weeklySpending[week] = (weeklySpending[week] || 0) + t.amount;
    });

  const weeks = Object.values(weeklySpending);
  
  let consistencyScore = 100;
  let consistencyLabel = "Stabil";
  let efficiencyScore = 100;

  if (weeks.length > 1) {
    const avg = weeks.reduce((a, b) => a + b, 0) / weeks.length;
    const variance = weeks.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / weeks.length;
    const stdDev = Math.sqrt(variance);
    
    // Coefficient of variation (CV) as percentage
    const cv = (stdDev / avg) * 100;
    
    // Score deduction based on volatility
    // If CV is 0% (perfectly same every week), score 100.
    // If CV is 50% (highly volatile), score drops significantly.
    consistencyScore = Math.max(0, 100 - Math.round(cv));
  }

  // Calculate Efficiency Score based on Ratio Adherence
  const analysis = analyzeFinances(transactions);
  
  // Deduct points for exceeding Wants limit
  if (analysis.wantRatio > TARGET_WANTS) {
    efficiencyScore -= (analysis.wantRatio - TARGET_WANTS) * 2;
  }
  // Deduct points for missing Savings target
  if (analysis.savingsRatio < TARGET_SAVINGS) {
    efficiencyScore -= (TARGET_SAVINGS - analysis.savingsRatio) * 2;
  }
  
  efficiencyScore = Math.max(0, Math.min(100, Math.round(efficiencyScore)));

  // Labels
  if (consistencyScore > 85) consistencyLabel = "Sangat Konsisten";
  else if (consistencyScore > 70) consistencyLabel = "Cukup Stabil";
  else if (consistencyScore > 50) consistencyLabel = "Volatil";
  else consistencyLabel = "Erratic (Tidak Terpola)";

  // Generate Warnings
  const warnings: Warning[] = [];

  if (analysis.wantRatio > TARGET_WANTS) {
    warnings.push({
      level: "critical",
      message: `Rasio keinginan mencapai ${analysis.wantRatio.toFixed(1)}% (Target: ${TARGET_WANTS}%).`,
      implication: "Mengurangi kapasitas akumulasi aset masa depan secara matematis."
    });
  }

  if (analysis.savingsRatio <= 0) {
    warnings.push({
      level: "critical",
      message: "Tidak ada surplus cashflow bulan ini.",
      implication: "Rentan terhadap guncangan finansial mendadak. Eksposur risiko 100%."
    });
  } else if (analysis.savingsRatio < TARGET_SAVINGS) {
    warnings.push({
      level: "warning",
      message: `Rasio tabungan ${analysis.savingsRatio.toFixed(1)}% di bawah ambang aman (${TARGET_SAVINGS}%).`,
      implication: "Memperlambat pencapaian kebebasan finansial sesuai deret ukur bunga majemuk."
    });
  }

  if (consistencyScore < 60) {
    warnings.push({
      level: "warning",
      message: "Variasi pengeluaran mingguan tinggi (>40% deviasi).",
      implication: "Menandakan impulsivitas atau perencanaan arus kas yang buruk."
    });
  }

  return {
    consistencyScore,
    consistencyLabel,
    efficiencyScore,
    warnings
  };
};

export const getDailyTrend = (transactions: Transaction[], days: number = 30): DayData[] => {
  // Generate last X days trend
  // ... (Mock implementation for now, or real logic if simpler)
  // Let's do a simple aggregation for chart
  const data: DayData[] = [];
  // Simplification for prototype
  return data; 
}
