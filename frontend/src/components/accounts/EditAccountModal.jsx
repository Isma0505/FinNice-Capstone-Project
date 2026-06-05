import { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import Modal from '../common/Modal';

function EditAccountModal({ isOpen, onClose, account, onUpdate }) {
  const { locale } = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        balance: account.balance || 0,
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'balance') {
      // Hanya terima angka, hapus semua non-digit
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('🔥 Tombol SIMPAN ditekan!');
    
    const updatedAccount = {
      ...account,
      name: formData.name,
      balance: parseInt(formData.balance, 10) || 0,  // ← parseInt, bukan Number()
    };
    
    onUpdate(updatedAccount);
    onClose();
  };

  // Format tampilan balance di input (tanpa titik, tanpa desimal)
  const displayBalance = formData.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={locale === 'id' ? 'Edit Akun' : 'Edit Account'}>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            {locale === 'id' ? 'Nama Akun' : 'Account Name'}
          </label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="input-group">
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            {locale === 'id' ? 'Saldo' : 'Balance'}
          </label>
          <input 
            type="text"  // ← ubah dari "number" ke "text"
            name="balance" 
            value={displayBalance}  // ← tampilkan dengan titik ribuan
            onChange={handleChange} 
            required 
          />
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {locale === 'id' ? 'Masukkan angka saja (contoh: 1000000)' : 'Enter numbers only (e.g., 1000000)'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            {locale === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            {locale === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditAccountModal;