import BudgetItem from './BudgetItem';
import { useLocale } from '../../contexts/LocaleContext';

function BudgetList({ budgets, getSpentByCategory }) {
  const { locale } = useLocale();

  if (budgets.length === 0) {
    return (
      <div className="stat-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          {locale === 'id' ? 'Belum ada anggaran. Buat anggaran baru!' : 'No budgets yet. Create a new budget!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid-stats">
      {budgets.map(budget => (
        <BudgetItem 
          key={budget.id} 
          budget={budget} 
          spent={getSpentByCategory(budget.category)} 
        />
      ))}
    </div>
  );
}

export default BudgetList;