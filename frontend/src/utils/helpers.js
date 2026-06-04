// Format Rupiah
export const formatRupiah = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
};

// Format tanggal
export const formatDate = (date, locale = 'id') => {
  return new Date(date).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format tanggal untuk filter
export const formatDateForFilter = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Hitung total pemasukan
export const getTotalIncome = (transactions) => {
  return transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
};

// Hitung total pengeluaran
export const getTotalExpense = (transactions) => {
  return transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
};

// Hitung saldo
export const getBalance = (transactions) => {
  return getTotalIncome(transactions) - getTotalExpense(transactions);
};

// Filter transaksi berdasarkan tanggal
export const filterTransactionsByDateRange = (transactions, startDate, endDate) => {
  if (!startDate && !endDate) return transactions;
  
  const start = startDate ? new Date(startDate) : new Date('2000-01-01');
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59);
  
  return transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= start && txDate <= end;
  });
};

// Generate data untuk grafik tren (line chart)
export const getMonthlyTrendData = (transactions, months = 6) => {
  const result = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
    const year = date.getFullYear();
    
    const monthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === year;
    });
    
    const income = monthTransactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
    const expense = monthTransactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
    
    result.push({
      month: monthName,
      income,
      expense,
      savings: income - expense
    });
  }
  
  return result;
};

// Export ke PDF
export const exportToPDF = async (transactions, startDate, endDate, totalIncome, totalExpense, balance) => {
  const { jsPDF } = await import('jspdf');
  const autoTable = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 230, 184);
  doc.text('FinNice - Laporan Keuangan', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Periode: ${startDate || 'Semua'} - ${endDate || 'Semua'}`, 14, 30);
  doc.text(`Tanggal cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);
  
  // Ringkasan
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('RINGKASAN KEUANGAN', 14, 50);
  
  doc.setFontSize(10);
  doc.text(`Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}`, 14, 60);
  doc.text(`Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}`, 14, 66);
  doc.text(`Saldo Akhir: Rp ${balance.toLocaleString('id-ID')}`, 14, 72);
  
  // Tabel Transaksi
  const tableData = transactions.map(tx => [
    formatDate(tx.date),
    tx.category,
    tx.description,
    tx.type === 'income' ? `Rp ${Number(tx.amount).toLocaleString('id-ID')}` : '',
    tx.type === 'expense' ? `Rp ${Number(tx.amount).toLocaleString('id-ID')}` : '',
  ]);
  
  autoTable.default(doc, {
    startY: 85,
    head: [['Tanggal', 'Kategori', 'Deskripsi', 'Pemasukan', 'Pengeluaran']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 230, 184], textColor: [0, 0, 0] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
  });
  
  // Footer
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Dicetak oleh FinNice - Personal Finance Manager', 14, finalY);
  
  doc.save(`finnice_laporan_${new Date().toISOString().split('T')[0]}.pdf`);
};