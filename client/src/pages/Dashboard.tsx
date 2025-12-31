import { Shell } from "@/components/layout/Shell";
import { RatioCard } from "@/components/dashboard/RatioCard";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  analyzeFinances,
  calculateConsistencyScore,
} from "@/lib/finance-engine";
import { generateAuditReport } from "@/lib/pdf-generator";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, ArrowRight, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function Dashboard() {
  const { transactions } = useTransactions();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const analysis = useMemo(() => analyzeFinances(transactions), [transactions]);
  const score = useMemo(
    () => calculateConsistencyScore(transactions),
    [transactions]
  );

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

  const handleViewJsonReport = () => {
    if (transactions.length === 0) {
      toast({
        title: "Data Kosong",
        description: "Tambahkan transaksi terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }
    setLocation("/reports");
  };

  const hasData = transactions.length > 0;
  const availableBalance = analysis.totalIncome - (analysis.savedAmount ?? 0);

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <h2 className="text-4xl font-display font-bold tracking-tight">
              Ringkasan Keuangan
            </h2>
            <p className="mt-2 text-sm font-mono text-muted-foreground">
              {hasData
                ? `Periode: ${analysis.period}`
                : "Belum ada data transaksi"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={handleExportPDF}
              disabled={!hasData}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Audit Report
            </Button>
            <Button
              variant="outline"
              onClick={handleViewJsonReport}
              disabled={!hasData}
              className="w-full sm:w-auto"
            >
              <FileJson className="mr-2 h-4 w-4" />
              Laporan JSON
            </Button>
          </div>
        </div>

        {!hasData ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16 md:py-20">
              <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-center text-sm text-muted-foreground max-w-sm">
                Mulai dengan menambahkan transaksi di menu{" "}
                <strong>Transaksi</strong> untuk melihat analisis
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* SAVINGS FLOW - Uang Diamankan Memotong dari Pemasukan */}
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono font-medium text-accent">
                  💰 Alur Uang Anda Bulan Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Pemasukan */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="text-2xl">📥</span>
                    <div className="flex-1">
                      <p className="text-xs font-mono text-muted-foreground">PEMASUKAN KOTOR</p>
                      <p className="text-lg font-bold font-mono text-accent">
                        Rp {analysis.totalIncome.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Dikurangi Tabungan */}
                  {(analysis.savedAmount ?? 0) > 0 && (
                    <>
                      <div className="flex justify-center">
                        <ArrowRight className="rotate-90 text-muted-foreground/50" />
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="text-2xl">🔒</span>
                        <div className="flex-1">
                          <p className="text-xs font-mono text-muted-foreground">DIAMANKAN UNTUK TABUNGAN</p>
                          <p className="text-lg font-bold font-mono text-green-500">
                            - Rp {(analysis.savedAmount ?? 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Sisa untuk Belanja */}
                  <div className="flex justify-center">
                    <ArrowRight className="rotate-90 text-muted-foreground/50" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-2xl">💸</span>
                    <div className="flex-1">
                      <p className="text-xs font-mono text-muted-foreground">TERSEDIA UNTUK BELANJA</p>
                      <p className="text-lg font-bold font-mono text-blue-500">
                        Rp {availableBalance.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Row - Income & Expense */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <Card className="glass border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Uang yang Dibelanjakan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl md:text-3xl font-bold font-mono text-destructive">
                    Rp {analysis.totalExpense.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    dari Rp {availableBalance.toLocaleString("id-ID")} yang tersedia
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Sisa Uang untuk Belanja
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl md:text-3xl font-bold font-mono ${
                    (availableBalance - analysis.totalExpense) >= 0
                      ? "text-accent"
                      : "text-destructive"
                  }`}>
                    Rp {(availableBalance - analysis.totalExpense).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(availableBalance - analysis.totalExpense) >= 0 
                      ? "Belanja Anda di bawah budget" 
                      : "Belanja Anda melebihi budget"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ratio Cards - Main Analysis */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                label="Uang yang Diamankan"
                value={analysis.savingsRatio}
                target={20}
                type="savings"
                amount={analysis.savedAmount ?? 0}
              />
            </div>

            {/* Net Cashflow & Score */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <Card className="glass border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Sisa Uang Bulan Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl md:text-3xl font-bold font-mono ${
                      analysis.netSavings >= 0
                        ? "text-accent"
                        : "text-destructive"
                    }`}
                  >
                    Rp {analysis.netSavings.toLocaleString("id-ID")}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {analysis.netSavings >= 0 ? "Masih ada sisa" : "Kekurangan"} bulan ini
                  </p>
                </CardContent>
              </Card>

              <ScoreCard
                score={score.consistencyScore}
                label={score.consistencyLabel}
                efficiency={score.efficiencyScore}
                warnings={score.warnings}
              />
            </div>

            {/* Warnings & Insights */}
            {score.warnings.length > 0 && (
              <Card className="glass-strong border-destructive/50 bg-destructive/10 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono font-medium text-destructive">
                    ⚠ Perhatian Penting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {score.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-destructive/50 pl-3 py-1"
                    >
                      <p className="text-xs font-medium text-foreground">
                        {w.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {w.implication}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
