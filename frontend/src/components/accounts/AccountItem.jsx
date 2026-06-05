// 1 item akun (kayak bca, gopay, gitu gitu)

import { formatRupiah } from '../../utils/helpers';

const accountImages = {
  BRI: '/img/Bank/BRI.png',
  BCA: '/img/Bank/BCA.jpg',
  BTN: '/img/Bank/BTN.png',
  BNI: '/img/Bank/BNI.jpg',
  MANDIRI: '/img/Bank/MANDIRI.png',
  JAGO: '/img/Bank/JAGO.png',
  DBS: '/img/Bank/DBS.png',
  DANA: '/img/E-Wallet/DANA.webp',
  OVO: '/img/E-Wallet/OVO.png',
  GOPAY: '/img/E-Wallet/GOPAY.png',
  SHOPEEPAY: '/img/E-Wallet/SHOPEEPAY.png',
};

const providerLabels = {
  BRI: 'BRI',
  BCA: 'BCA',
  BTN: 'BTN',
  BNI: 'BNI',
  MANDIRI: 'Mandiri',
  JAGO: 'Jago',
  DBS: 'DBS',
  DANA: 'DANA',
  OVO: 'OVO',
  GOPAY: 'GoPay',
  SHOPEEPAY: 'ShopeePay',
};

const getFallbackImage = (account) => {
  if (account.image) return account.image;
  if (account.provider && accountImages[account.provider]) return accountImages[account.provider];
  if (account.type === 'Bank') {
    const bankName = ['BRI', 'BCA', 'BTN', 'BNI', 'MANDIRI', 'JAGO', 'DBS'].find((key) => account.name?.toUpperCase().includes(key));
    return bankName ? accountImages[bankName] : '';
  }
  if (account.type === 'E-Wallet') {
    const walletName = ['DANA', 'OVO', 'GOPAY', 'SHOPEEPAY'].find((key) => account.name?.toUpperCase().includes(key));
    return walletName ? accountImages[walletName] : '';
  }
  return '';
};

function AccountItem({ account, onDelete, onEdit }) {  // ← tambah props onEdit
  const imageSrc = getFallbackImage(account);

  return (
    <div className="stat-card" style={{ position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '12px', 
        right: '12px',
        display: 'flex',
        gap: '8px',
        cursor: 'pointer'
      }}>
        {/* Tombol Edit */}
        <div 
          style={{ 
            color: 'var(--accent)',
            padding: '4px'
          }} 
          onClick={() => onEdit(account)}
        >
          <i className="fa-solid fa-pen"></i>
        </div>
        
        {/* Tombol Delete */}
        <div 
          style={{ 
            color: 'var(--text-secondary)',
            padding: '4px'
          }} 
          onClick={() => onDelete(account.id)}
        >
          <i className="fa-solid fa-trash"></i>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '12px', 
          background: imageSrc ? '#fff' : `${account.color}22`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: account.color,
          fontSize: '20px',
          overflow: 'hidden',
        }}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={account.provider || account.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <i className={`fa-solid ${account.icon}`}></i>
          )}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{account.name}</div>
          <span className="tag" style={{ fontSize: '11px', background: 'rgba(122, 139, 167, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
            {account.type}
          </span>
          {account.provider && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {providerLabels[account.provider] || account.provider}
            </div>
          )}
          {account.accountNumber && (
            <div style={{ marginTop: '2px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {account.type === 'Bank' ? 'Rek' : 'Telp'}: {account.accountNumber}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)' }}>
        {formatRupiah(account.balance)}
      </div>
    </div>
  );
}

export default AccountItem;