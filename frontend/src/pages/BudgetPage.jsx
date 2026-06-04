import { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { getBudgets, addBudget, getTransactions } from '../utils/api';
import { formatRupiah } from '../utils/helpers';
import BudgetList from '../components/budget/BudgetList';
import BudgetModal from '../components/budget/BudgetModal';

function BudgetPage() {
  const { locale } = useLocale();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    const budgetResult = await getBudgets();
    const txResult = await getTransactions();
    
    if (!budgetResult.error) setBudgets(budgetResult.data);
    if (!txResult.error) setTransactions(txResult.data);
    setLoading(false);
  };

  const getSpentByCategory = (category) => {
    return transactions
      .filter(tx => tx.type === 'expense' && tx.category === category)
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  };

  const handleAddBudget = async (newBudget) => {
    await addBudget(newBudget);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  // Perbaikan: konversi limit ke Number
  const totalBudget = budgets.reduce((sum, b) => sum + (Number(b.limit) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (Number(getSpentByCategory(b.category)) || 0), 0);
  const totalPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>{locale === 'id' ? 'Anggaran Bulanan' : 'Monthly Budget'}</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ width: 'auto', padding: '10px 20px' }}>
          + {locale === 'id' ? 'Tambah Anggaran' : 'Add Budget'}
        </button>
      </div>

      <div className="stat-card" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {locale === 'id' ? 'Total Anggaran' : 'Total Budget'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent)' }}>
            {formatRupiah(totalBudget)}
          </div>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>{locale === 'id' ? 'Terpakai' : 'Spent'}: {formatRupiah(totalSpent)}</span>
            <span>{totalPercent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${totalPercent}%`, background: totalPercent > 80 ? 'var(--danger)' : 'var(--accent)' }}></div>
          </div>
        </div>
      </div>

      <BudgetList budgets={budgets} getSpentByCategory={getSpentByCategory} />

      <BudgetModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddBudget}
      />
    </div>
  );
}

export default BudgetPage;