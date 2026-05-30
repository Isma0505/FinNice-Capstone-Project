// popup form untuk tambah akun baru

import { useState, useRef, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import Modal from '../common/Modal';

const accountOptions = {
  Bank: [
    { value: 'BRI', label: 'BRI', image: '/img/Bank/BRI.png', icon: 'fa-building-columns', color: '#00e6b8' },
    { value: 'BCA', label: 'BCA', image: '/img/Bank/BCA.jpg', icon: 'fa-building-columns', color: '#00c2ff' },
    { value: 'BTN', label: 'BTN', image: '/img/Bank/BTN.png', icon: 'fa-building-columns', color: '#8b5cf6' },
    { value: 'BNI', label: 'BNI', image: '/img/Bank/BNI.jpg', icon: 'fa-building-columns', color: '#f59e0b' },
    { value: 'MANDIRI', label: 'Mandiri', image: '/img/Bank/MANDIRI.png', icon: 'fa-building-columns', color: '#f97316' },
    { value: 'JAGO', label: 'Jago', image: '/img/Bank/JAGO.png', icon: 'fa-building-columns', color: '#ec4899' },
    { value: 'DBS', label: 'DBS', image: '/img/Bank/DBS.png', icon: 'fa-building-columns', color: '#ef4444' },
  ],
  'E-Wallet': [
    { value: 'DANA', label: 'DANA', image: '/img/E-Wallet/DANA.webp', icon: 'fa-wallet', color: '#60a5fa' },
    { value: 'OVO', label: 'OVO', image: '/img/E-Wallet/OVO.png', icon: 'fa-wallet', color: '#a855f7' },
    { value: 'GOPAY', label: 'GoPay', image: '/img/E-Wallet/GOPAY.png', icon: 'fa-wallet', color: '#22c55e' },
    { value: 'SHOPEEPAY', label: 'ShopeePay', image: '/img/E-Wallet/SHOPEEPAY.png', icon: 'fa-wallet', color: '#f97316' },
  ],
};

const getDefaultProvider = (type) => accountOptions[type]?.[0]?.value || '';

function AccountModal({ isOpen, onClose, onSubmit }) {
  const { locale } = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bank',
    provider: getDefaultProvider('Bank'),
    balance: '',
    accountNumber: '',
  });
  const [error, setError] = useState('');
  
  const nameInputRef = useRef(null);

  // Auto-focus ke field pertama saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };

      if (name === 'type') {
        nextData.provider = getDefaultProvider(value);
        nextData.accountNumber = '';
      }

      if (name === 'accountNumber') {
        nextData.accountNumber = value.replace(/\D/g, '');
      }

      return nextData;
    });

    setError('');
  };

  const handleProviderSelect = (providerOption) => {
    setFormData((prev) => ({
      ...prev,
      provider: providerOption.value,
      name: prev.name || providerOption.label,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedOptions = accountOptions[formData.type] || [];
    const selectedOption = selectedOptions.find((option) => option.value === formData.provider) || selectedOptions[0];
    const accountNumber = formData.accountNumber.trim();

    if (formData.type === 'Bank' && accountNumber.length < 10) {
      setError(locale === 'id' ? 'Nomor rekening harus minimal 10 digit.' : 'Bank account number must be at least 10 digits.');
      return;
    }

    if (formData.type === 'E-Wallet' && accountNumber.length < 10) {
      setError(locale === 'id' ? 'Nomor telepon harus minimal 10 digit.' : 'Phone number must be at least 10 digits.');
      return;
    }

    const fallbackTheme = {
      Bank: { icon: 'fa-building-columns', color: '#00e6b8' },
      'E-Wallet': { icon: 'fa-wallet', color: '#60a5fa' },
      Tunai: { icon: 'fa-money-bill-wave', color: '#ffb347' },
    };

    const theme = selectedOption || fallbackTheme[formData.type] || fallbackTheme.Bank;
    
    const newAccount = {
      name: formData.name,
      type: formData.type,
      balance: parseInt(formData.balance) || 0,
      provider: formData.type === 'Tunai' ? 'Tunai' : selectedOption?.value || formData.provider,
      accountNumber: formData.type === 'Tunai' ? '' : accountNumber,
      icon: theme.icon,
      color: theme.color,
      image: theme.image,
    };
    
    onSubmit(newAccount);
    setFormData({
      name: '',
      type: 'Bank',
      provider: getDefaultProvider('Bank'),
      balance: '',
      accountNumber: '',
    });
    setError('');
    onClose();
  };

  const selectedOptions = accountOptions[formData.type] || [];
  const numberLabel = formData.type === 'Bank'
    ? (locale === 'id' ? 'Nomor Rekening' : 'Account Number')
    : formData.type === 'E-Wallet'
      ? (locale === 'id' ? 'Nomor Telepon' : 'Phone Number')
      : '';
  const numberPlaceholder = formData.type === 'Bank'
    ? '1234567890'
    : formData.type === 'E-Wallet'
      ? '081234567890'
      : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={locale === 'id' ? 'Tambah Akun Baru' : 'Add New Account'}>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            {locale === 'id' ? 'Nama Akun' : 'Account Name'}
          </label>
          <input 
            ref={nameInputRef}
            type="text" 
            name="name" 
            placeholder={locale === 'id' ? 'Contoh: BCA Tabungan' : 'e.g., BCA Savings'} 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="input-group">
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            {locale === 'id' ? 'Tipe Akun' : 'Account Type'}
          </label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="Bank">🏦 Bank</option>
            <option value="E-Wallet">📱 E-Wallet</option>
            <option value="Tunai">💵 Tunai / Cash</option>
          </select>
        </div>

        {formData.type !== 'Tunai' && (
          <div className="input-group">
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              {locale === 'id' ? 'Pilih Provider' : 'Choose Provider'}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
              gap: '10px',
            }}>
              {selectedOptions.map((option) => {
                const isSelected = formData.provider === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleProviderSelect(option)}
                    style={{
                      border: isSelected ? `1px solid ${option.color}` : '1px solid rgba(122, 139, 167, 0.22)',
                      background: isSelected ? `${option.color}18` : 'rgba(14, 20, 33, 0.45)',
                      borderRadius: '14px',
                      padding: '10px 8px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      minHeight: '108px',
                    }}
                  >
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? `0 0 0 2px ${option.color}33` : 'none',
                    }}>
                      <img
                        src={option.image}
                        alt={option.label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {formData.type !== 'Tunai' && (
          <div className="input-group">
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              {numberLabel}
            </label>
            <input
              type="text"
              name="accountNumber"
              placeholder={numberPlaceholder}
              value={formData.accountNumber}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]*"
              minLength="10"
              required
            />
            <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {formData.type === 'Bank'
                ? (locale === 'id' ? 'Minimal 10 digit nomor rekening.' : 'At least 10 digits for the account number.')
                : (locale === 'id' ? 'Minimal 10 digit nomor telepon.' : 'At least 10 digits for the phone number.')}
            </div>
          </div>
        )}

        <div className="input-group">
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            {locale === 'id' ? 'Saldo Awal' : 'Initial Balance'}
          </label>
          <input 
            type="number" 
            name="balance" 
            placeholder="Rp 0" 
            value={formData.balance} 
            onChange={handleChange} 
            required 
          />
        </div>

        {error && (
          <div style={{
            marginTop: '-2px',
            marginBottom: '12px',
            color: 'var(--danger)',
            fontSize: '12px',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            {locale === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            <i className="fa-solid fa-save" style={{ marginRight: '8px' }}></i>
            {locale === 'id' ? 'Simpan Akun' : 'Save Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AccountModal;