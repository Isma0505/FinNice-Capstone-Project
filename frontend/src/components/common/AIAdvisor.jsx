import { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import Modal from './Modal';
import { formatRupiah } from '../../utils/helpers';
import { getAIAdvice } from '../../utils/api';

function AIAdvisor({ isOpen, onClose, budgets, transactions, totalExpense, totalIncome }) {
  const { locale } = useLocale();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate saran dari AI (simulasi, nanti panggil API real)
  const generateAdvice = async () => {
    setLoading(true);

    const result = await getAIAdvice({ budgets, transactions, locale });

    if (!result.error && result.data?.advice) {
      setAdvice(result.data.advice);
      setLoading(false);
      return;
    }
    
    // Simulasi delay AI mikir
    setTimeout(() => {
      // Cari budget yang over
      const overBudgetItems = [];
      const nearLimitItems = [];
      
      budgets.forEach(budget => {
        // Hitung spent untuk kategori ini dari transaksi
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
      
      // Buat saran berdasarkan data
      let adviceText = '';
      let adviceType = 'info'; // 'warning', 'danger', 'success'
      
      if (overBudgetItems.length > 0) {
        adviceType = 'danger';
        adviceText = locale === 'id'
          ? `⚠️ Perhatian! Kamu sudah melebihi budget untuk kategori: ${overBudgetItems.map(b => b.category).join(', ')}. Coba kurangi pengeluaran di kategori ini atau sesuaikan budget.`
          : `⚠️ Warning! You have exceeded the budget for categories: ${overBudgetItems.map(b => b.category).join(', ')}. Try to reduce spending in these categories or adjust your budget.`;
      } else if (nearLimitItems.length > 0) {
        adviceType = 'warning';
        adviceText = locale === 'id'
          ? `📊 Pengeluaran untuk ${nearLimitItems.map(b => b.category).join(', ')} sudah mendekati batas budget (${Math.round(nearLimitItems[0].percent)}%). Perhatikan pengeluaranmu!`
          : `📊 Spending for ${nearLimitItems.map(b => b.category).join(', ')} is approaching the budget limit (${Math.round(nearLimitItems[0].percent)}%). Watch your spending!`;
      } else {
        // Kalau aman, kasih rekomendasi positif
        const savings = totalIncome - totalExpense;
        const savingsPercent = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
        
        if (savingsPercent < 20) {
          adviceType = 'warning';
          adviceText = locale === 'id'
            ? `💡 Kamu hanya menabung ${Math.round(savingsPercent)}% dari pemasukan. Coba targetkan minimal 20% untuk tabungan.`
            : `💡 You're only saving ${Math.round(savingsPercent)}% of your income. Try to target at least 20% for savings.`;
        } else {
          adviceType = 'success';
          adviceText = locale === 'id'
            ? `🎉 Bagus! Pengeluaranmu terkontrol dengan baik. Kamu berhasil menabung ${formatRupiah(savings)} bulan ini. Pertahankan!`
            : `🎉 Great! Your spending is well controlled. You saved ${formatRupiah(savings)} this month. Keep it up!`;
        }
      }
      
      setAdvice({ text: adviceText, type: adviceType });
      setLoading(false);
    }, 1500);
  };

  // Generate ulang setiap modal dibuka
  useEffect(() => {
    if (isOpen) {
      generateAdvice();
    }
  }, [isOpen, budgets, transactions]);

  const getTypeStyles = () => {
    switch (advice?.type) {
      case 'danger':
        return {
          bg: 'rgba(255, 92, 114, 0.15)',
          border: 'var(--danger)',
          icon: 'fa-circle-exclamation',
          color: 'var(--danger)'
        };
      case 'warning':
        return {
          bg: 'rgba(255, 179, 71, 0.15)',
          border: 'var(--warning)',
          icon: 'fa-triangle-exclamation',
          color: 'var(--warning)'
        };
      case 'success':
        return {
          bg: 'rgba(0, 230, 184, 0.15)',
          border: 'var(--accent)',
          icon: 'fa-circle-check',
          color: 'var(--accent)'
        };
      default:
        return {
          bg: 'var(--accent-dim)',
          border: 'var(--accent)',
          icon: 'fa-robot',
          color: 'var(--accent)'
        };
    }
  };

  const styles = getTypeStyles();

  // Hitung total pemasukan & pengeluaran
  const totalPengeluaran = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalPemasukan = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const savings = totalPemasukan - totalPengeluaran;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={locale === 'id' ? '🤖 AI Financial Advisor' : '🤖 AI Financial Advisor'}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-brain" style={{ fontSize: '48px', color: 'var(--accent)', marginBottom: '16px', display: 'block' }}></i>
          <p>{locale === 'id' ? 'AI sedang menganalisis keuanganmu...' : 'AI is analyzing your finances...'}</p>
          <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: 'var(--accent)', borderRadius: '2px', animation: 'loading 1s infinite' }}></div>
          </div>
        </div>
      ) : advice ? (
        <div>
          {/* Ringkasan singkat */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: '12px',
            marginBottom: '20px',
            padding: '12px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {locale === 'id' ? 'Pemasukan' : 'Income'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--income)' }}>
                Rp {totalPemasukan.toLocaleString('id-ID')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {locale === 'id' ? 'Pengeluaran' : 'Expense'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--expense)' }}>
                Rp {totalPengeluaran.toLocaleString('id-ID')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {locale === 'id' ? 'Tabungan' : 'Savings'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: savings >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                Rp {savings.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
          
          {/* Saran AI */}
          <div style={{ 
            background: styles.bg,
            borderLeft: `4px solid ${styles.color}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <i className={`fa-solid ${styles.icon}`} style={{ fontSize: '20px', color: styles.color, marginTop: '2px' }}></i>
              <p style={{ margin: 0, lineHeight: 1.6, fontSize: '14px' }}>
                {advice.text}
              </p>
            </div>
          </div>
          
          {/* Tombol aksi */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              {locale === 'id' ? 'Tutup' : 'Close'}
            </button>
            <button className="btn-primary" onClick={() => {
              generateAdvice();
            }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <i className="fa-solid fa-rotate-right"></i>
              {locale === 'id' ? 'Minta Saran Lagi' : 'Ask Again'}
            </button>
          </div>
        </div>
      ) : null}
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 0%; }
        }
      `}</style>
    </Modal>
  );
}

export default AIAdvisor;