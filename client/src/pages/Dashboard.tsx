import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RatioCard } from "@/components/dashboard/RatioCard";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { FileText, Download, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BudgetCard } from "@/components/budget/BudgetCard";
import { SavingsGoals } from "@/components/savings/SavingsGoals";

interface SummaryData {
  totalIncome: number;
  allocatedSavings: number;
  availableForExpenses: number;
  totalRegularExpenses: number;
  totalExpense: number;
  netBalance: number;
  netSavings: number;
  needRatio: number;
  wantRatio: number;
  savingsRatio: number;
  breakdown: {
    need: number;
    want: number;
    savings: number;
  };
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: string;
  type: "income" | "expense";
  category: "need" | "want" | "savings";
  parentIncomeId?: number | null;
  isAllocation?: boolean;
}

interface Budget {
  id: number;
  userId: number;
  category: 'need' | 'want' | 'savings';
  monthlyLimit: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["summary"],
    queryFn: async () => {
      const res = await fetch("/api/summary");
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      const res = await fetch("/api/budgets");
      if (!res.ok) throw new Error("Failed to fetch budgets");
      return res.json();
    },
  });
  
  const queryClient = useQueryClient();
  
  const createBudgetMutation = useMutation({
    mutationFn: async ({ category, monthlyLimit }: { category: string; monthlyLimit: number }) => {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, monthlyLimit: monthlyLimit.toString() }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create budget');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
  
  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, monthlyLimit }: { id: number; monthlyLimit: number }) => {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyLimit: monthlyLimit.toString() }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update budget');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log("Export PDF");
  };

  const handleExportJSON = () => {
    if (summary) {
      const dataStr = JSON.stringify(summary, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };
  
  const handleExportExcel = () => {
    window.open('/api/export/excel', '_blank');
  };
  
  const handleExportCSV = () => {
    window.open('/api/export/csv', '_blank');
  };
  
  const handleCreateBudget = async (category: string, limit: number) => {
    await createBudgetMutation.mutateAsync({ category, monthlyLimit: limit });
  };
  
  const handleUpdateBudget = async (category: string, limit: number) => {
    const budget = budgets.find(b => b.category === category);
    if (budget) {
      await updateBudgetMutation.mutateAsync({ id: budget.id, monthlyLimit: limit });
    }
  };
  
  // Calculate current month spending by category
  const currentMonth = new Date();
  const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthSpending = transactions
    .filter(t => {
      const txDate = new Date(t.date);
      const txMonthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      return t.type === 'expense' && txMonthKey === currentMonthKey && !t.isAllocation;
    })
    .reduce((acc, t) => {
      const category = t.category;
      if (!acc[category]) acc[category] = 0;
      acc[category] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const isLoading = summaryLoading || transactionsLoading;
  const hasData = transactions.length > 0;

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Ringkasan Keuangan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analisis rasional perilaku finansial Anda
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={!hasData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!hasData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              disabled={!hasData}
            >
              <Download className="w-4 h-4 mr-2" />
              Laporan JSON
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {!isLoading && !hasData && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada data transaksi</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Mulai dengan menambahkan transaksi di menu <strong>Transaksi</strong> untuk melihat analisis keuangan Anda.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {!isLoading && hasData && summary && (
          <>
            {/* Financial Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Total Pemasukan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-green-500">
                    Rp {summary.totalIncome.toLocaleString('id-ID')}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Alokasi Tabungan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-blue-500">
                    Rp {summary.allocatedSavings.toLocaleString('id-ID')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Diamankan</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Tersedia Belanja
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-cyan-500">
                    Rp {summary.availableForExpenses.toLocaleString('id-ID')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Sisa untuk digunakan</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Total Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-red-500">
                    Rp {summary.totalRegularExpenses.toLocaleString('id-ID')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Belanja aktual</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Sisa Saldo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-mono ${summary.netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    Rp {summary.netBalance.toLocaleString('id-ID')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Tersedia - Belanja</p>
                </CardContent>
              </Card>
            </div>

            {/* Ratio Cards */}
            <div>
              <h2 className="text-xl font-display font-semibold mb-4">Rasio 50/30/20</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <RatioCard
                  label="Kebutuhan (Needs)"
                  value={summary.needRatio}
                  target={50}
                  type="need"
                  amount={summary.breakdown.need}
                />
                <RatioCard
                  label="Keinginan (Wants)"
                  value={summary.wantRatio}
                  target={30}
                  type="want"
                  amount={summary.breakdown.want}
                />
                <RatioCard
                  label="Tabungan (Savings)"
                  value={summary.savingsRatio}
                  target={20}
                  type="savings"
                  amount={summary.breakdown.savings}
                />
              </div>
            </div>

            {/* Budget Section */}
            <div>
              <h2 className="text-xl font-display font-semibold mb-4">Budget Bulanan</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <BudgetCard
                  category="need"
                  label="Kebutuhan"
                  currentSpending={currentMonthSpending.need || 0}
                  budget={budgets.find(b => b.category === 'need')}
                  onCreate={handleCreateBudget}
                  onUpdate={handleUpdateBudget}
                />
                <BudgetCard
                  category="want"
                  label="Keinginan"
                  currentSpending={currentMonthSpending.want || 0}
                  budget={budgets.find(b => b.category === 'want')}
                  onCreate={handleCreateBudget}
                  onUpdate={handleUpdateBudget}
                />
                <BudgetCard
                  category="savings"
                  label="Tabungan"
                  currentSpending={currentMonthSpending.savings || 0}
                  budget={budgets.find(b => b.category === 'savings')}
                  onCreate={handleCreateBudget}
                  onUpdate={handleUpdateBudget}
                />
              </div>
            </div>

            {/* Savings Goals Section */}
            <SavingsGoals />

            {/* Recent Transactions */}
            <div>
              <h2 className="text-xl font-display font-semibold mb-4">Transaksi Terbaru</h2>
              <TransactionTable transactions={transactions.slice(0, 5)} />
            </div>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Memuat data...</div>
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
