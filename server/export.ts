import ExcelJS from 'exceljs';
import type { Transaction } from '../shared/schema';

export async function exportToExcel(transactions: Transaction[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transaksi');

  // Set column headers with styling
  worksheet.columns = [
    { header: 'Tanggal', key: 'date', width: 15 },
    { header: 'Deskripsi', key: 'description', width: 35 },
    { header: 'Tipe', key: 'type', width: 12 },
    { header: 'Kategori', key: 'category', width: 15 },
    { header: 'Nominal (Rp)', key: 'amount', width: 18 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data rows
  transactions.forEach((t) => {
    worksheet.addRow({
      date: new Date(t.date).toLocaleDateString('id-ID'),
      description: t.description,
      type: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      category: t.category === 'need' ? 'Kebutuhan' : t.category === 'want' ? 'Keinginan' : 'Tabungan',
      amount: Number(t.amount),
    });
  });

  // Format amount column as currency
  worksheet.getColumn('amount').numFmt = '#,##0';

  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['Tanggal', 'Deskripsi', 'Tipe', 'Kategori', 'Nominal (Rp)'];
  
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('id-ID'),
    `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.category === 'need' ? 'Kebutuhan' : t.category === 'want' ? 'Keinginan' : 'Tabungan',
    Number(t.amount).toString(),
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
