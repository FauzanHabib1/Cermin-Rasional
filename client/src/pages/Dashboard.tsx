import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RatioCard } from "@/components/dashboard/RatioCard";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { FileText, Download, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={!hasData}
            >
              <FileText className="w-4 h-4 mr-2" />
              Audit Report
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
            <div className="grid gap-4 md:grid-cols-3">
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
                    Total Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-red-500">
                    Rp {summary.totalExpense.toLocaleString('id-ID')}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Sisa / Tabungan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-mono ${summary.netSavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    Rp {summary.netSavings.toLocaleString('id-ID')}
                  </div>
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
