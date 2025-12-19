import { useState, useMemo } from "react";
import { Shell } from "@/components/layout/Shell";
import { RatioCard } from "@/components/dashboard/RatioCard";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { AddTransaction } from "@/components/forms/AddTransaction";
import { analyzeFinances, calculateConsistencyScore } from "@/lib/finance-engine";
import { generateAuditReport } from "@/lib/pdf-generator";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const { toast } = useToast();

  const analysis = useMemo(() => analyzeFinances(transactions), [transactions]);
  const score = useMemo(() => calculateConsistencyScore(transactions), [transactions]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions([newTx, ...transactions]);
    toast({
      title: "Data Tercatat",
      description: "Analisis real-time diperbarui.",
    });
  };

  const handleExportPDF = () => {
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

  return (
    <Shell>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Financial Cockpit</h2>
            <p className="text-muted-foreground font-mono text-xs sm:text-sm mt-1">
              Periode: {analysis.period}
            </p>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setTransactions(MOCK_TRANSACTIONS)} className="text-xs sm:text-sm">
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Reset Data</span>
              <span className="sm:hidden">Reset</span>
            </Button>
            <Button variant="secondary" onClick={handleExportPDF} size="sm" className="text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Audit Report (PDF)</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <AddTransaction onAdd={handleAddTransaction} />
          </div>
        </div>

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

        {/* Recent Transactions */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-display font-bold truncate">Log Transaksi Terakhir</h3>
          </div>
          <div className="overflow-x-auto">
            <TransactionTable transactions={transactions} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
