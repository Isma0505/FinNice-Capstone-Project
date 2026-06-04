import { useState, useEffect, useRef, memo } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { formatRupiah } from '../../utils/helpers';
import { getAIAdvice } from '../../utils/api';

function AIAdviceWidget({ budgets, transactions }) {
  const { locale } = useLocale();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasLoaded = useRef(false);

  // Generate saran dari AI
  const generateAdvice = async () => {
    setLoading(true);
    setAdvice(null); // Reset advice biar keliatan loading

    const totalIncome = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const result = await getAIAdvice({ budgets, transactions, locale });

    if (!result.error && result.data?.advice) {
      setAdvice(result.data.advice);
      setLoading(false);
      return;
    }
    
    // Fallback logic
    setTimeout(() => {
      const overBudgetItems = [];
      const nearLimitItems = [];
      
      budgets.forEach(budget => {
        const spent = transactions
          .filter(tx => tx.type === 'expense' && tx.category === budget.category)
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const percent = (spent / budget.limit) * 100;
        
        if (spent > budget.limit) {
          overBudgetItems.push({ ...budget, spent, percent });
        } else if (percent >= 80) {
          nearLimitItems.push({ ...budget, spent, percent });
        }
      });
      
      const savings = totalIncome - totalExpense;
      const savingsPercent = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
      
      let adviceText = '';
      let adviceType = 'info';
      let suggestion = '';
      
      if (overBudgetItems.length > 0) {
        adviceType = 'danger';
        adviceText = `⚠️ Perhatian! Budget ${overBudgetItems.map(b => b.category).join(', ')} sudah over.`;
        suggestion = `Coba kurangi pengeluaran di kategori ini atau sesuaikan budget.`;
      } else if (nearLimitItems.length > 0) {
        adviceType = 'warning';
        adviceText = `📊 Pengeluaran ${nearLimitItems.map(b => b.category).join(', ')} sudah mendekati batas.`;
        suggestion = `Sisa ${nearLimitItems.map(b => `${b.category} ${formatRupiah(b.limit - b.spent)}`).join(', ')}.`;
      } else if (savingsPercent < 20 && savingsPercent > 0) {
        adviceType = 'warning';
        adviceText = `💡 Tabungan hanya ${Math.round(savingsPercent)}% dari pemasukan.`;
        suggestion = `Targetkan minimal 20% untuk tabungan. Coba kurangi pengeluaran tidak penting.`;
      } else if (savings > 0) {
        adviceType = 'success';
        adviceText = `🎉 Bagus! Kamu menabung ${formatRupiah(savings)} bulan ini.`;
        suggestion = `Pertahankan kebiasaan baik ini!`;
      } else if (savings < 0) {
        adviceType = 'danger';
        adviceText = `⚠️ Pengeluaran melebihi pemasukan ${formatRupiah(Math.abs(savings))}.`;
        suggestion = `Segera evaluasi pengeluaranmu!`;
      } else {
        adviceType = 'info';
        adviceText = `🤖 Saya siap membantu mengelola keuanganmu.`;
        suggestion = `Tambah transaksi dan budget untuk saran yang lebih akurat.`;
      }
      
      setAdvice({ text: adviceText, suggestion, type: adviceType });
      setLoading(false);
    }, 500);
  };

  // Hanya generate pertama kali
  useEffect(() => {
    if ((budgets.length > 0 || transactions.length > 0) && !hasLoaded.current) {
      hasLoaded.current = true;
      generateAdvice();
    } else if (budgets.length === 0 && transactions.length === 0 && !hasLoaded.current) {
      hasLoaded.current = true;
      setAdvice({
        text: '👋 Selamat datang di FinNice!',
        suggestion: 'Mulai dengan menambahkan transaksi dan budget untuk mendapatkan saran keuangan.',
        type: 'info'
      });
    }
  }, []);

  const getTypeStyles = () => {
    switch (advice?.type) {
      case 'danger':
        return { bg: 'rgba(255, 92, 114, 0.15)', border: 'var(--danger)', icon: 'fa-circle-exclamation', color: 'var(--danger)' };
      case 'warning':
        return { bg: 'rgba(255, 179, 71, 0.15)', border: 'var(--warning)', icon: 'fa-triangle-exclamation', color: 'var(--warning)' };
      case 'success':
        return { bg: 'rgba(0, 230, 184, 0.15)', border: 'var(--accent)', icon: 'fa-circle-check', color: 'var(--accent)' };
      default:
        return { bg: 'var(--accent-dim)', border: 'var(--accent)', icon: 'fa-robot', color: 'var(--accent)' };
    }
  };

  const styles = getTypeStyles();

  // Tampilkan loading saat sedang refresh
  if (loading) {
    return (
      <div className="stat-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
          <span>{locale === 'id' ? 'AI sedang menganalisis keuanganmu...' : 'AI is analyzing your finances...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card" style={{ 
      marginBottom: '24px', 
      background: styles.bg,
      borderLeft: `4px solid ${styles.color}`,
      cursor: 'pointer'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <i className={`fa-solid ${styles.icon}`} style={{ fontSize: '20px', color: styles.color, marginTop: '2px' }}></i>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
            🤖 AI Financial Advisor
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', lineHeight: 1.5 }}>
            {advice?.text}
          </div>
          {advice?.suggestion && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              💡 {advice?.suggestion}
            </div>
          )}
        </div>
        <button 
          onClick={generateAdvice}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: styles.color, 
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(180deg)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          title={locale === 'id' ? 'Refresh saran' : 'Refresh advice'}
        >
          <i className="fa-solid fa-rotate-right"></i>
        </button>
      </div>
    </div>
  );
}

export default memo(AIAdviceWidget);