import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginInput from '../components/auth/LoginInput';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';
import { HiOutlineLanguage } from 'react-icons/hi2';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../utils/api';

function LoginPage({ onLogin, onSwitchToRegister }) {
  const { locale, toggleLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-container">
      <div className="floating-shapes" aria-hidden="true">
        <span className="shape shape-1" />
        <span className="shape shape-2" />
        <span className="shape shape-3" />
        <span className="shape shape-4" />
        <span className="shape shape-5" />
      </div>

      <div className="auth-card glass tilt-card auth-panel">
        <div className="tilt-glare" />

        <div className="auth-topbar">
          <div className="auth-switch-group">
            <button type="button" className="auth-icon-btn" onClick={toggleLocale} aria-label="language">
              {locale === 'id' ? <FiGlobe /> : <HiOutlineLanguage />}
            </button>
            <button type="button" className="auth-icon-btn" onClick={toggleTheme} aria-label="theme">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
          </div>
        </div>

        <div className="auth-brand">
          <div className="auth-logo-cube" aria-hidden="true">
            <span className="cube-face cube-front" />
            <span className="cube-face cube-back" />
            <span className="cube-face cube-right" />
            <span className="cube-face cube-left" />
            <span className="cube-face cube-top" />
            <span className="cube-face cube-bottom" />
          </div>
          <h1>FinNice</h1>
          <p>{locale === 'id' ? 'Kelola keuangan pribadi Anda dengan cerdas' : 'Manage your personal finances smartly'}</p>
        </div>

        <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--accent-dim)', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{locale === 'id' ? 'Akun demo siap pakai:' : 'Ready-to-use demo account:'}</strong>
          <div style={{ marginTop: '6px' }}>Email: {DEMO_EMAIL}</div>
          <div>Password: {DEMO_PASSWORD}</div>
        </div>

        <LoginInput onLogin={onLogin} />

        <p className="auth-switch-text">
          {locale === 'id' ? 'Belum punya akun?' : "Don't have an account?"}{' '}
          <button type="button" onClick={onSwitchToRegister} className="auth-switch-link">
            {locale === 'id' ? 'Daftar sekarang' : 'Register now'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;