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
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Financial Cockpit</h2>
            <p className="text-muted-foreground font-mono text-xs sm:text-sm mt-1">
              {hasData ? `Periode: ${analysis.period}` : "Belum ada data transaksi"}
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleExportPDF}
            disabled={!hasData}
            size="sm" 
            className="text-xs sm:text-sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Audit Report (PDF)</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>

        {!hasData ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center text-sm">
                Mulai dengan menambahkan transaksi di menu <strong>Transaksi</strong> untuk melihat analisis
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Main Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

            {/* Score & Warnings */}
            <ScoreCard 
              score={score.consistencyScore} 
              label={score.consistencyLabel} 
              efficiency={score.efficiencyScore}
              warnings={score.warnings}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Total Pemasukan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-accent">
                    Rp {analysis.totalIncome.toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Total Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-destructive">
                    Rp {analysis.totalExpense.toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
                    Net Cashflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-xl sm:text-2xl font-bold font-mono ${analysis.netSavings >= 0 ? 'text-accent' : 'text-destructive'}`}>
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
