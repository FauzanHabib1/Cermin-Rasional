import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Transaction, MonthlyAnalysis, ScoreCard } from "./types";

export function generateAuditReport(
  transactions: Transaction[],
  analysis: MonthlyAnalysis,
  score: ScoreCard
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("LAPORAN AUDIT PERILAKU KEUANGAN", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tanggal Audit: ${format(new Date(), "dd MMMM yyyy", { locale: id })}`, pageWidth / 2, 28, { align: "center" });
  doc.text("Sifat: Rasional & Objektif", pageWidth / 2, 33, { align: "center" });

  doc.line(20, 38, pageWidth - 20, 38);

  // Section 1: Ringkasan Eksekutif
  let yPos = 50;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. RINGKASAN EKSEKUTIF", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summary = [
    `Total Pemasukan: Rp ${analysis.totalIncome.toLocaleString('id-ID')}`,
    `Total Pengeluaran: Rp ${analysis.totalExpense.toLocaleString('id-ID')}`,
    `Net Cashflow: Rp ${analysis.netSavings.toLocaleString('id-ID')}`,
    `Skor Konsistensi: ${score.consistencyScore}/100 (${score.consistencyLabel})`,
    `Tingkat Efisiensi: ${score.efficiencyScore}/100`
  ];

  summary.forEach((line) => {
    doc.text(`• ${line}`, 25, yPos);
    yPos += 7;
  });

  // Section 2: Analisis Rasio
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. ANALISIS RASIO & KEPATUHAN", 20, yPos);

  yPos += 10;
  const ratioData = [
    ["Kategori", "Target", "Realisasi", "Deviasi", "Status"],
    ["Kebutuhan (Needs)", "50%", `${analysis.needRatio.toFixed(1)}%`, `${(analysis.needRatio - 50).toFixed(1)}%`, analysis.needRatio > 50 ? "MELAMPAUI" : "OK"],
    ["Keinginan (Wants)", "30%", `${analysis.wantRatio.toFixed(1)}%`, `${(analysis.wantRatio - 30).toFixed(1)}%`, analysis.wantRatio > 30 ? "INEFISIEN" : "OK"],
    ["Tabungan (Savings)", "20%", `${analysis.savingsRatio.toFixed(1)}%`, `${(analysis.savingsRatio - 20).toFixed(1)}%`, analysis.savingsRatio < 20 ? "DEFISIT" : "OK"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [ratioData[0]],
    body: ratioData.slice(1),
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { fontStyle: 'bold' }
    }
  });

  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 20;

  // Section 3: Temuan & Peringatan Logis
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3. TEMUAN & IMPLIKASI LOGIS", 20, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  if (score.warnings.length === 0) {
    doc.text("• Tidak ditemukan anomali signifikan. Perilaku sesuai parameter logis.", 25, yPos);
  } else {
    score.warnings.forEach((warn) => {
      // Split text to fit width
      const textLines = doc.splitTextToSize(`• [${warn.level.toUpperCase()}] ${warn.message} Implikasi: ${warn.implication}`, pageWidth - 40);
      doc.text(textLines, 25, yPos);
      yPos += (textLines.length * 5) + 3;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Dokumen ini dihasilkan secara otomatis oleh algoritma Ratio.", pageWidth / 2, 280, { align: "center" });
  doc.text("Keputusan keuangan tetap menjadi tanggung jawab pengguna.", pageWidth / 2, 285, { align: "center" });

  doc.save("laporan_audit_keuangan.pdf");
}
