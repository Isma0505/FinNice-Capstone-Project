import { formatRupiah, formatDate } from '../../utils/helpers';
import { useLocale } from '../../contexts/LocaleContext';

function TransactionItem({ transaction, onDelete }) {
  const { locale } = useLocale();

  return (
    <div className="tx-item">
      <div className="tx-icon" style={{ background: `${transaction.color}22`, color: transaction.color }}>
        <i className={`fa-solid ${transaction.icon}`}></i>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{transaction.description}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {transaction.category} • {formatDate(transaction.date, locale)}
        </div>
      </div>
      <div style={{ 
        fontWeight: 600, 
        color: transaction.type === 'income' ? 'var(--income)' : 'var(--expense)',
        marginRight: '12px'
      }}>
        {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount)}
      </div>
      <button 
        onClick={() => onDelete(transaction.id)}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}
      >
        <i className="fa-solid fa-trash"></i>
      </button>
    </div>
  );
}

export default TransactionItem;