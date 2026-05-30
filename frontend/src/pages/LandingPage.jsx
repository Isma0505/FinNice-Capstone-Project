import { useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';
import { HiOutlineLanguage } from 'react-icons/hi2';

function LandingPage() {
  const navigate = useNavigate();
  const { locale, toggleLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <div className="auth-logo-cube landing-logo-cube" aria-hidden="true">
            <span className="cube-face cube-front" />
            <span className="cube-face cube-back" />
            <span className="cube-face cube-right" />
            <span className="cube-face cube-left" />
            <span className="cube-face cube-top" />
            <span className="cube-face cube-bottom" />
          </div>
          <h1>FinNice</h1>
        </div>
        <div className="header-actions">
          <button onClick={toggleLocale} className="icon-btn">
            {locale === 'id' ? <FiGlobe /> : <HiOutlineLanguage />}
          </button>
          <button onClick={toggleTheme} className="icon-btn">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          <button onClick={() => navigate('/login')} className="btn-outline">
            {locale === 'id' ? 'Masuk' : 'Login'}
          </button>
          <button onClick={() => navigate('/register')} className="btn-primary-small">
            {locale === 'id' ? 'Daftar Gratis' : 'Sign Up Free'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            {locale === 'id' 
              ? 'Kelola Keuangan Pribadi' 
              : 'Personal Finance Management'}
            <span className="gradient-text"> FinNice</span>
          </h1>
          <p>
            {locale === 'id'
              ? 'Catat pemasukan, kelola pengeluaran, dan raih tujuan keuanganmu dengan mudah.'
              : 'Track income, manage expenses, and achieve your financial goals easily.'}
          </p>
          <button onClick={() => navigate('/register')} className="btn-primary-large">
            {locale === 'id' ? 'Mulai Sekarang' : 'Get Started'}
          </button>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <i className="fa-solid fa-chart-line"></i>
            <span>+45%</span>
          </div>
          <div className="floating-card card-2">
            <i className="fa-solid fa-wallet"></i>
            <span>Rp 15.000.000</span>
          </div>
          <div className="floating-card card-3">
            <i className="fa-solid fa-piggy-bank"></i>
            <span>{locale === 'id' ? 'Target Tercapai!' : 'Goal Achieved!'}</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>{locale === 'id' ? 'Fitur Unggulan' : 'Key Features'}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><i className="fa-solid fa-chart-pie"></i></div>
            <h3>{locale === 'id' ? 'Dashboard Pintar' : 'Smart Dashboard'}</h3>
            <p>{locale === 'id' ? 'Lihat ringkasan keuangan dengan grafik interaktif.' : 'View financial summary with interactive charts.'}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fa-solid fa-arrow-right-arrow-left"></i></div>
            <h3>{locale === 'id' ? 'Catat Transaksi' : 'Track Transactions'}</h3>
            <p>{locale === 'id' ? 'Catat pemasukan dan pengeluaran dengan mudah.' : 'Easily record income and expenses.'}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fa-solid fa-wallet"></i></div>
            <h3>{locale === 'id' ? 'Kelola Anggaran' : 'Manage Budget'}</h3>
            <p>{locale === 'id' ? 'Buat anggaran dan pantau pengeluaranmu.' : 'Create budgets and monitor your spending.'}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fa-solid fa-building-columns"></i></div>
            <h3>{locale === 'id' ? 'Multi Akun' : 'Multi Accounts'}</h3>
            <p>{locale === 'id' ? 'Kelola berbagai akun bank dan e-wallet.' : 'Manage various bank and e-wallet accounts.'}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>{locale === 'id' ? 'Siap Mengatur Keuanganmu?' : 'Ready to Manage Your Finances?'}</h2>
          <p>{locale === 'id' ? 'Bergabunglah dengan ribuan pengguna FinNice.' : 'Join thousands of FinNice users.'}</p>
          <button onClick={() => navigate('/register')} className="btn-primary-large">
            {locale === 'id' ? 'Daftar Sekarang' : 'Sign Up Now'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2026 FinNice. {locale === 'id' ? 'Kelola Keuangan Pribadi' : 'Personal Finance Management'}</p>
      </footer>
    </div>
  );
}

export default LandingPage;