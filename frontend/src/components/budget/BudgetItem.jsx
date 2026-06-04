import { useLocale } from '../../contexts/LocaleContext';
import { formatRupiah } from '../../utils/helpers';

function BudgetItem({ budget, spent }) {
  const { locale } = useLocale();
  const percent = budget.limit > 0 ? Math.min(100, Math.round((spent / Number(budget.limit)) * 100)) : 0;
  const isOver = spent > Number(budget.limit);

  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          background: `${budget.color}22`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: budget.color
        }}>
          <i className={`fa-solid ${budget.icon}`}></i>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{budget.category}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {locale === 'id' ? 'Batas' : 'Limit'}: {formatRupiah(budget.limit)}
          </div>
        </div>
        <span className={isOver ? 'tag-expense' : 'tag-income'} style={{ fontSize: '11px' }}>
          {isOver ? (locale === 'id' ? 'Melebihi' : 'Over') : (locale === 'id' ? 'Aman' : 'Safe')}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
          <span>{formatRupiah(spent)}</span>
          <span>{percent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%`, background: isOver ? 'var(--danger)' : budget.color }}></div>
        </div>
      </div>
      
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {locale === 'id' ? 'Sisa' : 'Remaining'}: {formatRupiah(Math.max(0, budget.limit - spent))}
      </div>
    </div>
  );
}

export default BudgetItem;