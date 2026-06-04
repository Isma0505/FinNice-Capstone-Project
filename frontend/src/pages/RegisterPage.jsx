import { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import RegisterInput from '../components/auth/RegisterInput';
import { register } from '../utils/api';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';
import { HiOutlineLanguage } from 'react-icons/hi2';

function RegisterPage({ onRegister, onSwitchToLogin }) {
  const { locale, toggleLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (userData) => {
    setLoading(true);
    setError('');
    
    const result = await register(userData);
    
    if (result.success) {
      // Registrasi berhasil, langsung login atau arahkan ke login
      onRegister({ name: userData.name, email: userData.email });
    } else {
      setError(result.message || 'Registrasi gagal');
    }
    
    setLoading(false);
  };

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

        {error && (
          <div style={{ 
            background: 'rgba(255, 92, 114, 0.15)', 
            border: '1px solid var(--danger)', 
            borderRadius: '8px', 
            padding: '10px', 
            marginBottom: '16px',
            color: 'var(--danger)',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <RegisterInput onRegister={handleRegister} loading={loading} />

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