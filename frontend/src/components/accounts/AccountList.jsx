// kumpulan item akun (AccountItem)

import AccountItem from './AccountItem';
import { useLocale } from '../../contexts/LocaleContext';

function AccountList({ accounts, onDelete }) {
  const { locale } = useLocale();

  if (accounts.length === 0) {
    return (
      <div className="stat-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          {locale === 'id' ? 'Belum ada akun. Tambah akun baru!' : 'No accounts yet. Add a new account!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid-stats">
      {accounts.map(account => (
        <AccountItem key={account.id} account={account} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default AccountList;