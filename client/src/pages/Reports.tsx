import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import {
  analyzeFinances,
  calculateConsistencyScore,
} from "@/lib/finance-engine";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

export default function Reports() {
  const { transactions } = useTransactions();
  const { toast } = useToast();

  const analysis = useMemo(() => analyzeFinances(transactions), [transactions]);
  const score = useMemo(
    () => calculateConsistencyScore(transactions),
    [transactions]
  );

  // Generate JSON report
  const jsonReport = useMemo(() => {
    const availableBalance = analysis.totalIncome - (analysis.savedAmount ?? 0);
    return {
      period: analysis.period,
      summary: {
        totalIncome: analysis.totalIncome,
        savedAmount: analysis.savedAmount ?? 0,
        availableForSpending: availableBalance,
        totalExpense: analysis.totalExpense,
        netSavings: analysis.netSavings,
      },
      breakdown: {
        needs: {
          amount: analysis.needExpense,
          percentage: analysis.needRatio,
          target: 50,
          status: analysis.needRatio <= 50 ? "✓ OK" : "✗ OVER",
        },
        wants: {
          amount: analysis.wantExpense,
          percentage: analysis.wantRatio,
          target: 30,
          status: analysis.wantRatio <= 30 ? "✓ OK" : "✗ OVER",
        },
        savings: {
          amount: analysis.savedAmount ?? 0,
          percentage: analysis.savingsRatio,
          target: 20,
          status: analysis.savingsRatio >= 20 ? "✓ OK" : "✗ UNDER",
        },
      },
      score: {
        consistency: score.consistencyScore,
        consistency_label: score.consistencyLabel,
        efficiency: score.efficiencyScore,
        warnings: score.warnings.map(w => ({
          level: w.level,
          message: w.message,
          implication: w.implication,
        })),
      },
      transactions: transactions.map(t => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        isAllocation: t.isAllocation ?? false,
      })),
    };
  }, [transactions, analysis, score]);

  const jsonString = JSON.stringify(jsonReport, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    toast({
      title: "Disalin",
      description: "Laporan JSON telah disalin ke clipboard",
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([jsonString], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `laporan-keuangan-${analysis.period.replace(" ", "-")}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Unduh Berhasil",
      description: "File JSON telah diunduh",
    });
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight">
            Laporan Keuangan (JSON)
          </h2>
          <p className="mt-2 text-sm font-mono text-muted-foreground">
            Format data lengkap yang dapat diimpor ke sistem lain
          </p>
        </div>

        {transactions.length === 0 ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16 md:py-20">
              <p className="text-center text-sm text-muted-foreground max-w-sm">
                Tambahkan transaksi untuk melihat laporan
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleCopy} variant="secondary">
                <Copy className="mr-2 h-4 w-4" />
                Salin JSON
              </Button>
              <Button onClick={handleDownload} variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Unduh JSON
              </Button>
            </div>

            {/* JSON Display */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase">
                  Data JSON
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-border/50 max-h-96 overflow-y-auto">
                    <code>{jsonString}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="glass border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Total Pemasukan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold font-mono text-accent">
                    Rp {analysis.totalIncome.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Diamankan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold font-mono text-green-500">
                    Rp {(analysis.savedAmount ?? 0).toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Dibelanjakan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold font-mono text-destructive">
                    Rp {analysis.totalExpense.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Sisa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-xl font-bold font-mono ${
                    analysis.netSavings >= 0 ? "text-accent" : "text-destructive"
                  }`}>
                    Rp {analysis.netSavings.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 50/30/20 Breakdown */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">
                  Analisis Rasio 50/30/20
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div>
                      <p className="font-semibold">Kebutuhan (Needs)</p>
                      <p className="text-xs text-muted-foreground">Target: 50%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {analysis.needRatio.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rp {analysis.needExpense.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div>
                      <p className="font-semibold">Keinginan (Wants)</p>
                      <p className="text-xs text-muted-foreground">Target: 30%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {analysis.wantRatio.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rp {analysis.wantExpense.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div>
                      <p className="font-semibold">Tabungan (Savings)</p>
                      <p className="text-xs text-muted-foreground">Target: 20%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {analysis.savingsRatio.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rp {(analysis.savedAmount ?? 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Shell>
  );
}
