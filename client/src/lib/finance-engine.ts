import {
  Transaction,
  MonthlyAnalysis,
  ScoreCard,
  Warning,
  DayData,
} from "./types";
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  getWeek,
  subMonths,
  format,
} from "date-fns";

// Rational Constants
const TARGET_NEEDS = 50;
const TARGET_WANTS = 30;
const TARGET_SAVINGS = 20;

export const analyzeFinances = (
  transactions: Transaction[],
  currentDate: Date = new Date()
): MonthlyAnalysis => {
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);

  // Filter current month transactions
  const monthlyTransactions = transactions.filter((t) =>
    isWithinInterval(new Date(t.date), {
      start: currentMonthStart,
      end: currentMonthEnd,
    })
  );

  // Income = all income transactions
  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  // Expenses = only "need" and "want" categories (NOT savings)
  // Savings is no longer an expense category
  const expenses = monthlyTransactions.filter(
    (t) => t.type === "expense" && (t.category === "need" || t.category === "want")
  );

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const needExpense = expenses
    .filter((t) => t.category === "need")
    .reduce((sum, t) => sum + t.amount, 0);

  const wantExpense = expenses
    .filter((t) => t.category === "want")
    .reduce((sum, t) => sum + t.amount, 0);

  // Savings = sum of all allocations (isAllocation = true)
  // These are amounts set aside from income, not spent
  const savedAmount = monthlyTransactions
    .filter((t) => t.isAllocation === true)
    .reduce((sum, t) => sum + t.amount, 0);

  // Net Savings = Income - Expenses - Allocations
  // This is the money remaining (not yet allocated or spent)
  const netSavings = totalIncome - totalExpense - savedAmount;

  // Ratios based on income (not expense)
  const needRatio = totalIncome ? (needExpense / totalIncome) * 100 : 0;
  const wantRatio = totalIncome ? (wantExpense / totalIncome) * 100 : 0;
  const savingsRatio = totalIncome ? (savedAmount / totalIncome) * 100 : 0;

  return {
    period: format(currentDate, "MMMM yyyy"),
    totalIncome,
    totalExpense,
    needExpense,
    wantExpense,
    savedAmount,
    netSavings,
    needRatio,
    wantRatio,
    savingsRatio,
    transactionCount: monthlyTransactions.length,
  };
};

export const calculateConsistencyScore = (
  transactions: Transaction[]
): ScoreCard => {
  // Logic: Calculate weekly spending variance
  // Group by week
  const weeklySpending: Record<string, number> = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const week = getWeek(new Date(t.date));
      weeklySpending[week] = (weeklySpending[week] || 0) + t.amount;
    });

  const weeks = Object.values(weeklySpending);

  let consistencyScore = 100;
  let consistencyLabel = "Stabil";
  let efficiencyScore = 100;

  if (weeks.length > 1) {
    const avg = weeks.reduce((a, b) => a + b, 0) / weeks.length;
    const variance =
      weeks.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / weeks.length;
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
      message: `Rasio keinginan mencapai ${analysis.wantRatio.toFixed(
        1
      )}% (Target: ${TARGET_WANTS}%).`,
      implication:
        "Mengurangi kapasitas akumulasi aset masa depan secara matematis.",
    });
  }

  if (analysis.savingsRatio <= 0) {
    warnings.push({
      level: "critical",
      message: "Tidak ada surplus cashflow bulan ini.",
      implication:
        "Rentan terhadap guncangan finansial mendadak. Eksposur risiko 100%.",
    });
  } else if (analysis.savingsRatio < TARGET_SAVINGS) {
    warnings.push({
      level: "warning",
      message: `Rasio tabungan ${analysis.savingsRatio.toFixed(
        1
      )}% di bawah ambang aman (${TARGET_SAVINGS}%).`,
      implication:
        "Memperlambat pencapaian kebebasan finansial sesuai deret ukur bunga majemuk.",
    });
  }

  if (consistencyScore < 60) {
    warnings.push({
      level: "warning",
      message: "Variasi pengeluaran mingguan tinggi (>40% deviasi).",
      implication:
        "Menandakan impulsivitas atau perencanaan arus kas yang buruk.",
    });
  }

  return {
    consistencyScore,
    consistencyLabel,
    efficiencyScore,
    warnings,
  };
};

export const getDailyTrend = (
  transactions: Transaction[],
  days: number = 30
): DayData[] => {
  // Generate last X days trend
  // ... (Mock implementation for now, or real logic if simpler)
  // Let's do a simple aggregation for chart
  const data: DayData[] = [];
  // Simplification for prototype
  return data;
};

/**
 * Calculate realistic saving capacity for the current month.
 * - Treats 'savings' transactions as already committed.
 * - availableForSaving = totalIncome - needExpense - safetyBuffer
 * safetyBuffer is a minimal buffer calculated as 10% of income (simple heuristic)
 */
export function calculateSavingCapacity(transactions: Transaction[]) {
  const analysis = analyzeFinances(transactions);
  const totalIncome = analysis.totalIncome;
  const needExpense = analysis.needExpense;
  const savedAlready = analysis.savedAmount ?? 0;

  const safetyBuffer = Math.round(totalIncome * 0.1);
  let availableForSaving = Math.max(0, totalIncome - needExpense - safetyBuffer - (analysis.totalExpense - needExpense - (analysis.savedAmount ?? 0)));

  // availableForSaving should not include already saved amount
  availableForSaving = Math.max(0, availableForSaving - savedAlready);

  // Recommend safe monthly savings as 50% of availableForSaving (conservative)
  const recommended = Math.floor((availableForSaving * 0.5) / 1000) * 1000;

  return {
    totalIncome,
    needExpense,
    savedAlready,
    safetyBuffer,
    availableForSaving,
    recommended,
  };
}

/**
 * Generate a plain-language, 6-point report for the user as requested.
 * Returns a short text suitable for display to non-technical users.
 */
export function generatePlainReport(
  transactions: Transaction[],
  savingsGoal?: number
) {
  const analysis = analyzeFinances(transactions);
  const totalIncome = analysis.totalIncome;
  const totalExpense = analysis.totalExpense;
  const saved = analysis.savedAmount ?? 0;
  const net = analysis.netSavings;
  const capacity = calculateSavingCapacity(transactions);

  // 1. Condition
  let condition: string;
  if (net >= totalIncome * 0.2) condition = "aman";
  else if (net >= 0) condition = "cukup rawan";
  else condition = "berbahaya";

  const condReason =
    net >= totalIncome * 0.2
      ? "Anda menyisihkan cukup sisa setelah pengeluaran."
      : net >= 0
      ? "Pemasukan cukup menutup pengeluaran, tapi sisa sedikit."
      : "Pengeluaran melebihi pemasukan; arus kas negatif.";

  // 2. Where money goes (most by amount and frequency)
  // Find largest expense category by sum and by count
  const expenseTx = transactions.filter((t) => t.type === "expense");
  const sumByCategory: Record<string, number> = {};
  const countByCategory: Record<string, number> = {};
  expenseTx.forEach((t) => {
    sumByCategory[t.category] = (sumByCategory[t.category] || 0) + t.amount;
    countByCategory[t.category] = (countByCategory[t.category] || 0) + 1;
  });
  const largestCategory =
    Object.keys(sumByCategory).sort(
      (a, b) => (sumByCategory[b] || 0) - (sumByCategory[a] || 0)
    )[0] || "tidak ada";
  const frequentCategory =
    Object.keys(countByCategory).sort(
      (a, b) => (countByCategory[b] || 0) - (countByCategory[a] || 0)
    )[0] || "tidak ada";

  // Friendly labels
  const labelMap: Record<string, string> = {
    need: "kebutuhan",
    want: "keinginan",
    savings: "tabungan",
  };

  // 3. One main pattern: find day-of-month or weekday with most spending
  let pattern = "Tidak ada pola pengeluaran yang jelas.";
  if (expenseTx.length > 0) {
    const byDay: Record<number, number> = {};
    expenseTx.forEach((t) => {
      const d = new Date(t.date).getDate();
      byDay[d] = (byDay[d] || 0) + t.amount;
    });
    const topDay = Object.keys(byDay).sort(
      (a, b) => byDay[Number(b)] - byDay[Number(a)]
    )[0];
    if (topDay)
      pattern = `Seringkali pengeluaran besar terjadi sekitar tanggal ${topDay} setiap bulan.`;
  }

  // 4. Realistic saving ability
  const safeSave = capacity.recommended;
  const saveExplanation =
    safeSave > 0
      ? `Anda realistis bisa menabung sekitar Rp ${safeSave.toLocaleString(
          "id-ID"
        )} bulan ini. Ini konservatif; sisakan juga buffer Rp ${capacity.safetyBuffer.toLocaleString("id-ID")}.`
      : "Saat ini sulit menyisihkan uang tanpa mengurangi pengeluaran.";

  // 5. Evaluate goal
  let goalEval = "Tidak ada target tabungan diberikan.";
  if (savingsGoal !== undefined) {
    if (savingsGoal <= safeSave)
      goalEval =
        "Target masuk akal jika Anda konsisten menabung sesuai kemampuan yang disarankan.";
    else if (net <= 0)
      goalEval =
        "Target terlalu tinggi saat ini karena arus kas negatif; perbaiki pengeluaran dulu.";
    else
      goalEval =
        "Target lebih tinggi dari kemampuan menabung saat ini; pertimbangkan memperpanjang jangka waktu atau kurangi target bulanan.";
  }

  // 6. Up to three concrete actions
  const actions: string[] = [];
  if (largestCategory && largestCategory !== "savings") {
    actions.push(
      `Kurangi pengeluaran pada ${
        labelMap[largestCategory] || largestCategory
      } paling besar—misal potong langganan atau makan di luar sekali seminggu.`
    );
  }
  if (safeSave > 0)
    actions.push(
      `Tetapkan transfer otomatis Rp ${safeSave.toLocaleString(
        "id-ID"
      )} ke tabungan di awal bulan.`
    );
  if (expenseTx.length > 3)
    actions.push(
      "Tinjau pengeluaran mingguan dan catat 2 pengeluaran yang bisa dikurangi bulan ini."
    );
  // limit to 3
  while (actions.length > 3) actions.pop();

  // Build final text
  const parts = [];
  parts.push(`1. Kondisi bulan ini: ${condition}. ${condReason}`);
  parts.push(
    `2. Ke mana uang paling banyak & sering habis: Jumlah terbesar ke: ${
      labelMap[largestCategory] || largestCategory
    }. Sering terjadi pada: ${
      labelMap[frequentCategory] || frequentCategory
    }. Contoh: pengeluaran besar seperti belanja besar atau makan di luar mengurangi kemampuan menabung.`
  );
  parts.push(`3. Pola utama: ${pattern}`);
  parts.push(`4. Kemampuan menabung realistis: ${saveExplanation}`);
  parts.push(`5. Evaluasi target tabungan: ${goalEval}`);
  parts.push(
    `6. Saran tindakan: ${
      actions.length > 0
        ? actions.map((a, i) => `${i + 1}. ${a}`).join(" | ")
        : "Tidak ada saran spesifik."
    }`
  );

  return parts.join("\n\n");
}
