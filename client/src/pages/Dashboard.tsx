import { Shell } from "@/components/layout/Shell";
import { RatioCard } from "@/components/dashboard/RatioCard";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeFinances, calculateConsistencyScore } from "@/lib/finance-engine";
import { generateAuditReport } from "@/lib/pdf-generator";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

export default function Dashboard() {
  const { transactions } = useTransactions();
  const { toast } = useToast();

  const analysis = useMemo(() => analyzeFinances(transactions), [transactions]);
  const score = useMemo(() => calculateConsistencyScore(transactions), [transactions]);

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      toast({
        title: "Data Kosong",
        description: "Tambahkan transaksi terlebih dahulu sebelum ekspor.",
        variant: "destructive",
      });
      return;
    }
    try {
      generateAuditReport(transactions, analysis, score);
      toast({
        title: "Laporan Dibuat",
        description: "File PDF telah diunduh.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Gagal Ekspor",
        description: "Terjadi kesalahan saat membuat PDF.",
        variant: "destructive",
      });
    }
  };

  const hasData = transactions.length > 0;

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight">Financial Cockpit</h2>
            <p className="mt-1 text-xs font-mono text-muted-foreground sm:text-sm">
              {hasData ? `Periode: ${analysis.period}` : "Belum ada data transaksi"}
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleExportPDF}
            disabled={!hasData}
            size="sm" 
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Audit Report (PDF)
          </Button>
        </div>

        {!hasData ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-center text-sm text-muted-foreground">
                Mulai dengan menambahkan transaksi di menu <strong>Transaksi</strong> untuk melihat analisis
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Ratio Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <RatioCard 
                label="Kebutuhan (Needs)" 
                value={analysis.needRatio} 
                target={50} 
                type="need" 
                amount={analysis.needExpense}
              />
              <RatioCard 
                label="Keinginan (Wants)" 
                value={analysis.wantRatio} 
                target={30} 
                type="want" 
                amount={analysis.wantExpense}
              />
              <RatioCard 
                label="Tabungan (Savings)" 
                value={analysis.savingsRatio} 
                target={20} 
                type="savings" 
                amount={analysis.netSavings}
              />
            </div>

            {/* Score Card */}
            <ScoreCard 
              score={score.consistencyScore} 
              label={score.consistencyLabel} 
              efficiency={score.efficiencyScore}
              warnings={score.warnings}
            />

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                    Total Pemasukan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-xl font-bold text-accent sm:text-2xl">
                    Rp {analysis.totalIncome.toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                    Total Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-xl font-bold text-destructive sm:text-2xl">
                    Rp {analysis.totalExpense.toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                    Net Cashflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`font-mono text-xl font-bold sm:text-2xl ${analysis.netSavings >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    Rp {analysis.netSavings.toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
