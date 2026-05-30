import StatsCard from '../common/StatsCard';
import { formatRupiah } from '../../utils/helpers';
import { useLocale } from '../../contexts/LocaleContext';

function StatsCards({ balance, totalIncome, totalExpense }) {
  const { locale } = useLocale();

  return (
    <div className="grid-stats">
      <StatsCard 
        title={locale === 'id' ? 'Saldo Total' : 'Total Balance'}
        value={formatRupiah(balance)}
        color="var(--accent)"
      />
      <StatsCard 
        title={locale === 'id' ? 'Total Pemasukan' : 'Total Income'}
        value={formatRupiah(totalIncome)}
        color="var(--income)"
      />
      <StatsCard 
        title={locale === 'id' ? 'Total Pengeluaran' : 'Total Expense'}
        value={formatRupiah(totalExpense)}
        color="var(--expense)"
      />
    </div>
  );
}

export default StatsCards;