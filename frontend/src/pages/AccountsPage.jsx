import { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { getAccounts, addAccount, deleteAccount, updateAccount } from '../utils/api';
import { formatRupiah } from '../utils/helpers';
import AccountList from '../components/accounts/AccountList';
import AccountModal from '../components/accounts/AccountModal';
import EditAccountModal from '../components/accounts/EditAccountModal';  // ← tambah ini

function AccountsPage() {
  const { locale } = useLocale();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);  // ← tambah
  const [editingAccount, setEditingAccount] = useState(null);  // ← tambah

  const fetchAccounts = async () => {
    const result = await getAccounts();
    if (!result.error) {
      setAccounts(result.data);
    }
    setLoading(false);
  };

  const handleAddAccount = async (newAccount) => {
    await addAccount(newAccount);
    fetchAccounts();
  };

  const handleUpdateAccount = async (updatedAccount) => {  // ← tambah
    await updateAccount(updatedAccount.id, updatedAccount);
    fetchAccounts();
  };

  const handleDeleteAccount = async (id) => {
    if (window.confirm(locale === 'id' ? 'Hapus akun ini?' : 'Delete this account?')) {
      await deleteAccount(id);
      fetchAccounts();
    }
  };

  const handleEditClick = (account) => {  // ← tambah
    setEditingAccount(account);
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) return <p>Loading...</p>;

  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>{locale === 'id' ? 'Akun Keuangan' : 'Financial Accounts'}</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ width: 'auto', padding: '10px 20px' }}>
          + {locale === 'id' ? 'Tambah Akun' : 'Add Account'}
        </button>
      </div>

      <div className="stat-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--accent-dim), var(--bg-card))' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {locale === 'id' ? 'Total Saldo Semua Akun' : 'Total Balance All Accounts'}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>
          {formatRupiah(totalBalance)}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {accounts.length} {locale === 'id' ? 'akun terdaftar' : 'accounts registered'}
        </div>
      </div>

      <AccountList 
        accounts={accounts} 
        onDelete={handleDeleteAccount}
        onEdit={handleEditClick}  // ← tambah ini
      />

      <AccountModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddAccount}
      />

      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        onUpdate={handleUpdateAccount}
      />
    </div>
  );
}

export default AccountsPage;