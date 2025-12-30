// Centralized UI copy for savings allocation, confirmations, and reports
export const UI_COPY = {
  allocation: {
    label: 'Alokasi Tabungan (Rp) — jumlah yang ingin Anda amankan dari pemasukan ini',
    error_over_income: (alloc: number, income: number) => `Tidak bisa mengamankan Rp ${alloc.toLocaleString('id-ID')}. Pemasukan hanya Rp ${income.toLocaleString('id-ID')}. Kurangi alokasi.`,
    help: 'Pisahkan sejumlah uang dari pemasukan untuk tujuan tabungan. Uang ini disimpan, bukan dibelanjakan.'
  },
  deleteIncomeConfirm: (sumAlloc: number) => `Peringatan: Menghapus pemasukan ini juga akan menghapus alokasi tabungan sebesar Rp ${sumAlloc.toLocaleString('id-ID')}. Lanjutkan?`,
  editIncomeBlock: (sumAlloc: number) => `Perubahan tidak boleh membuat alokasi melebihi pemasukan. Total alokasi terkait: Rp ${sumAlloc.toLocaleString('id-ID')}. Sesuaikan alokasi terlebih dahulu.`,
  report: {
    title: 'Laporan Keuangan Sederhana',
    savingsExplainer: (saved: number) => `Tabungan: Rp ${saved.toLocaleString('id-ID')} — ini jumlah yang sudah Anda amankan dari pemasukan (dipisah, tidak untuk dibelanjakan).`
  }
};

export default UI_COPY;
