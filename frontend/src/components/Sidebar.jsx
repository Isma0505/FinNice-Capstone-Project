import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { FiLogOut } from 'react-icons/fi';

function Sidebar({ isOpen, onClose, onLogout }) {
  const { locale } = useLocale();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', path: '/', icon: 'fa-chart-pie', labelId: 'Dashboard', labelEn: 'Dashboard' },
    { id: 'transactions', path: '/transactions', icon: 'fa-arrow-right-arrow-left', labelId: 'Transaksi', labelEn: 'Transactions' },
    { id: 'budget', path: '/budget', icon: 'fa-wallet', labelId: 'Anggaran', labelEn: 'Budget' },
    { id: 'accounts', path: '/accounts', icon: 'fa-building-columns', labelId: 'Akun', labelEn: 'Accounts' },
    { id: 'settings', path: '/settings', icon: 'fa-gear', labelId: 'Pengaturan', labelEn: 'Settings' },
  ];

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="sidebar-brand">
            <div className="auth-logo-cube sidebar-logo-cube" aria-hidden="true">
              <span className="cube-face cube-front" />
              <span className="cube-face cube-back" />
              <span className="cube-face cube-right" />
              <span className="cube-face cube-left" />
              <span className="cube-face cube-top" />
              <span className="cube-face cube-bottom" />
            </div>
            <h2 className="sidebar-brand-title">FinNice</h2>
          </div>
        </div>
        
        <nav style={{ padding: '16px 0', flex: 1 }}>
          {menuItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
              style={{ textDecoration: 'none' }}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{locale === 'id' ? item.labelId : item.labelEn}</span>
            </Link>
          ))}
        </nav>

        {/* Tombol Logout di bagian bawah sidebar */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid var(--border)',
          marginTop: 'auto'
        }}>
          <div 
            className="nav-item logout-btn"
            onClick={handleLogout}
            style={{ 
              cursor: 'pointer',
              color: 'var(--danger)'
            }}
          >
            <FiLogOut size={18} />
            <span>{locale === 'id' ? 'Keluar' : 'Logout'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;