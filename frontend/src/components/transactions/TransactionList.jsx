import TransactionItem from './TransactionItem';
import { useLocale } from '../../contexts/LocaleContext';

function TransactionList({ transactions, onDelete }) {
  const { locale } = useLocale();

  if (transactions.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        {locale === 'id' ? 'Belum ada transaksi' : 'No transactions yet'}
      </p>
    );
  }

  return (
    <>
      {transactions.map(tx => (
        <TransactionItem key={tx.id} transaction={tx} onDelete={onDelete} />
      ))}
    </>
  );
}

export default TransactionList;