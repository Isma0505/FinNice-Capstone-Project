import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import RegisterInput from '../components/auth/RegisterInput';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';
import { HiOutlineLanguage } from 'react-icons/hi2';

function RegisterPage({ onRegister, onSwitchToLogin }) {
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
          <div className="auth-logo-cube auth-logo-cube-tilt" aria-hidden="true">
            <span className="cube-face cube-front" />
            <span className="cube-face cube-back" />
            <span className="cube-face cube-right" />
            <span className="cube-face cube-left" />
            <span className="cube-face cube-top" />
            <span className="cube-face cube-bottom" />
          </div>
          <h1>FinNice</h1>
          <p>{locale === 'id' ? 'Buat akun baru dan mulai kelola keuangan' : 'Create a new account and start managing finances'}</p>
        </div>

        <RegisterInput onRegister={onRegister} />

        <p className="auth-switch-text">
          {locale === 'id' ? 'Sudah punya akun?' : 'Already have an account?'}{' '}
          <button type="button" onClick={onSwitchToLogin} className="auth-switch-link">
            {locale === 'id' ? 'Masuk' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;