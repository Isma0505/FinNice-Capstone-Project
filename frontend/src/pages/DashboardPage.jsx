import { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { getTransactions, getBudgets } from '../utils/api';
import { getTotalIncome, getTotalExpense, getBalance, formatRupiah } from '../utils/helpers';
import StatsCards from '../components/dashboard/StatsCards';
import BarChartComponent from '../components/dashboard/BarChartComponent';
import PieChartComponent from '../components/dashboard/PieChartComponent';
import AIAdviceWidget from '../components/dashboard/AIAdviceWidget';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardPage() {
  const { locale } = useLocale();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodType, setPeriodType] = useState('monthly'); // 'monthly' atau 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });

  const fetchData = async () => {
    const txResult = await getTransactions();
    const budgetResult = await getBudgets();
    if (!txResult.error) setTransactions(txResult.data);
    if (!budgetResult.error) setBudgets(budgetResult.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter transaksi berdasarkan periode yang dipilih
  const getFilteredTransactions = () => {
    if (periodType === 'monthly') {
      const [year, month] = selectedMonth.split('-');
      return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === parseInt(year) && txDate.getMonth() + 1 === parseInt(month);
      });
    } else {
      return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === parseInt(selectedYear);
      });
    }
  };

  const filteredTransactions = getFilteredTransactions();

  // Data untuk statistik
  const totalIncome = getTotalIncome(filteredTransactions);
  const totalExpense = getTotalExpense(filteredTransactions);
  const balance = getBalance(filteredTransactions);

  // Data untuk grafik batang (per bulan dalam periode)
  const getBarChartData = () => {
    const result = [];
    
    if (periodType === 'monthly') {
      // Tampilkan 6 bulan terakhir untuk bulanan
      const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
      const currentDate = new Date(parseInt(selectedYear), parseInt(selectedMonthNum) - 1, 1);
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
        
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
        });
        
        const income = monthTransactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
        const expense = monthTransactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
        
        result.push({ month: monthName, income, expense });
      }
    } else {
      // Tampilkan 12 bulan dalam setahun untuk tahunan
      const year = parseInt(selectedYear);
      for (let month = 1; month <= 12; month++) {
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
        
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === month - 1 && txDate.getFullYear() === year;
        });
        
        const income = monthTransactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
        const expense = monthTransactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
        
        result.push({ month: monthName, income, expense });
      }
    }
    return result;
  };

  // Data untuk pie chart (kategori pengeluaran periode ini)
  const expenseByCategory = {};
  filteredTransactions.forEach(tx => {
    if (tx.type === 'expense') {
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    }
  });

  const pieData = Object.keys(expenseByCategory).map(category => ({
    name: category,
    value: expenseByCategory[category],
  }));

  // Data untuk line chart (tren 6 bulan terakhir untuk bulanan, atau tren per bulan untuk tahunan)
  const getTrendData = () => {
    const result = [];
    
    if (periodType === 'monthly') {
      // Tren 6 bulan terakhir
      const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
      const currentDate = new Date(parseInt(selectedYear), parseInt(selectedMonthNum) - 1, 1);
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
        
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
        });
        
        const income = monthTransactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
        const expense = monthTransactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
        
        result.push({ month: monthName, income, expense, savings: income - expense });
      }
    } else {
      // Tren per bulan dalam setahun
      const year = parseInt(selectedYear);
      for (let month = 1; month <= 12; month++) {
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
        
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === month - 1 && txDate.getFullYear() === year;
        });
        
        const income = monthTransactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
        const expense = monthTransactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
        
        result.push({ month: monthName, income, expense, savings: income - expense });
      }
    }
    return result;
  };

  const barData = getBarChartData();
  const trendData = getTrendData();

  // Generate opsi bulan (2024-2026)
  const getMonthOptions = () => {
    const options = [];
    const years = [2024, 2025, 2026];
    for (const year of years) {
      for (let month = 1; month <= 12; month++) {
        const date = new Date(year, month - 1, 1);
        const value = `${year}-${String(month).padStart(2, '0')}`;
        const label = date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });
        options.push({ value, label });
      }
    }
    return options;
  };

  // Generate opsi tahun
  const getYearOptions = () => {
    return [2024, 2025, 2026].map(year => ({
      value: year.toString(),
      label: year.toString()
    }));
  };

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: 0, color: '#00e6b8' }}>Pemasukan: {formatRupiah(payload[0]?.value || 0)}</p>
          <p style={{ margin: 0, color: '#ff7b8a' }}>Pengeluaran: {formatRupiah(payload[1]?.value || 0)}</p>
          <p style={{ margin: 0, color: '#ffb347' }}>Tabungan: {formatRupiah(payload[2]?.value || 0)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <p>Loading...</p>;

  // Judul periode untuk ditampilkan
  const getPeriodTitle = () => {
    if (periodType === 'monthly') {
      const option = monthOptions.find(o => o.value === selectedMonth);
      return option?.label || selectedMonth;
    } else {
      return `Tahun ${selectedYear}`;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>{locale === 'id' ? 'Dashboard' : 'Dashboard'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {locale === 'id' ? 'Ringkasan keuangan Anda' : 'Your financial summary'}
          </p>
        </div>
        
        {/* Filter Periode */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Pilihan Bulanan / Tahunan */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '4px' }}>
            <button
              onClick={() => setPeriodType('monthly')}
              style={{
                padding: '6px 16px',
                borderRadius: '10px',
                border: 'none',
                background: periodType === 'monthly' ? 'var(--accent)' : 'transparent',
                color: periodType === 'monthly' ? '#070b14' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📅 {locale === 'id' ? 'Bulanan' : 'Monthly'}
            </button>
            <button
              onClick={() => setPeriodType('yearly')}
              style={{
                padding: '6px 16px',
                borderRadius: '10px',
                border: 'none',
                background: periodType === 'yearly' ? 'var(--accent)' : 'transparent',
                color: periodType === 'yearly' ? '#070b14' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📆 {locale === 'id' ? 'Tahunan' : 'Yearly'}
            </button>
          </div>

          {/* Dropdown Bulan atau Tahun */}
          {periodType === 'monthly' ? (
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '8px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* AI Advisor Widget */}
      <AIAdviceWidget budgets={budgets} transactions={filteredTransactions} />

      {/* Stats Cards */}
      <StatsCards balance={balance} totalIncome={totalIncome} totalExpense={totalExpense} />

      {/* Ringkasan periode yang dipilih */}
      <div className="stat-card" style={{ marginBottom: '24px', background: 'var(--accent-dim)', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {locale === 'id' ? 'Ringkasan' : 'Summary'} {getPeriodTitle()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '8px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{locale === 'id' ? 'Pemasukan' : 'Income'}</span>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--income)' }}>{formatRupiah(totalIncome)}</div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{locale === 'id' ? 'Pengeluaran' : 'Expense'}</span>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--expense)' }}>{formatRupiah(totalExpense)}</div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{locale === 'id' ? 'Tabungan' : 'Savings'}</span>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>{formatRupiah(balance)}</div>
          </div>
        </div>
      </div>

      {/* Grafik - 3 kolom */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Bar Chart - Pemasukan vs Pengeluaran */}
        <div className="stat-card">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>
            {periodType === 'monthly' 
              ? (locale === 'id' ? '6 Bulan Terakhir' : 'Last 6 Months')
              : (locale === 'id' ? 'Per Bulan dalam Setahun' : 'Monthly in Year')}
          </h3>
          <BarChartComponent data={barData} />
        </div>

        {/* Line Chart - Tren Keuangan */}
        <div className="stat-card">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>
            📈 {periodType === 'monthly' 
              ? (locale === 'id' ? 'Tren 6 Bulan Terakhir' : '6-Month Trend')
              : (locale === 'id' ? 'Tren Keuangan Tahunan' : 'Yearly Financial Trend')}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="income" name={locale === 'id' ? 'Pemasukan' : 'Income'} stroke="#00e6b8" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expense" name={locale === 'id' ? 'Pengeluaran' : 'Expense'} stroke="#ff7b8a" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="savings" name={locale === 'id' ? 'Tabungan' : 'Savings'} stroke="#ffb347" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Kategori Pengeluaran */}
        <div className="stat-card">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>
            {locale === 'id' ? 'Kategori Pengeluaran' : 'Expense Category'}
          </h3>
          <PieChartComponent data={pieData} totalExpense={totalExpense} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;