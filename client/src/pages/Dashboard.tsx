import { Shell } from "@/components/layout/Shell";
import { RatioCard } from "@/components/dashboard/RatioCard";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  analyzeFinances,
  calculateConsistencyScore,
} from "@/lib/finance-engine";
import { generatePlainReport } from "@/lib/finance-engine";
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

  const handleShowPlainReport = () => {
    const report = generatePlainReport(transactions);
    // show in a new window so user can copy, simple approach
    const w = window.open("", "_blank", "noopener");
    if (w) {
      w.document.write(
        '<pre style="white-space:pre-wrap;font-family:monospace;padding:16px;">' +
          report.replace(/</g, "&lt;") +
          "</pre>"
      );
      w.document.title = "Laporan Keuangan Sederhana";
    } else {
      // fallback: copy to clipboard
      navigator.clipboard?.writeText(report);
      alert(
        "Laporan disalin ke clipboard. Buka halaman Transaksi untuk meninjau jika perlu."
      );
    }
  };

  const hasData = transactions.length > 0;

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
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            disabled={!hasData}
            className="w-full md:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Audit Report
          </Button>
          <Button
            variant="ghost"
            onClick={handleShowPlainReport}
            disabled={!hasData}
            className="ml-2 hidden md:inline-flex"
          >
            Laporan Sederhana
          </Button>
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
            {/* Summary Row - Income & Expense */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <Card className="glass border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Total Pemasukan Bulan Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl md:text-3xl font-bold font-mono text-accent">
                    Rp {analysis.totalIncome.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>

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

            {/* Savings Management Card */}
            <div className="mt-4">
              <Card className="glass border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
                    Tentang Uang yang Diamankan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Uang yang diamankan adalah uang yang Anda pisahkan dari pemasukan.
                    Uang ini tidak dihitung sebagai pengeluaran dan tidak boleh dipakai untuk belanja.
                    <br /><br />
                    Untuk mengamankan uang, tambahkan transaksi pemasukan di menu <strong>Transaksi</strong>,
                    lalu tentukan berapa yang ingin diamankan.
                  </p>
                  <div className="mt-3">
                    <a href="/transactions">
                      <Button variant="secondary">Buka Transaksi</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
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
