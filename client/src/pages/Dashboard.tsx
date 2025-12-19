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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Financial Cockpit</h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Periode: {analysis.period}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => setTransactions(MOCK_TRANSACTIONS)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Data
          </Button>
          <Button variant="secondary" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Audit Report (PDF)
          </Button>
          <AddTransaction onAdd={handleAddTransaction} />
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-bold">Log Transaksi Terakhir</h3>
        </div>
        <TransactionTable transactions={transactions} />
      </div>
    </Shell>
  );
}
