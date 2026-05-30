import { useState } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import useInput from '../../hooks/useInput';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../utils/api';

function LoginInput({ onLogin }) {
  const { locale } = useLocale();
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password, rememberMe });
  };

  const fillDemoAccount = () => {
    onEmailChange({ target: { value: DEMO_EMAIL } });
    onPasswordChange({ target: { value: DEMO_PASSWORD } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <FaEnvelope className="icon-left" />
        <input
          type="email"
          placeholder={locale === 'id' ? 'Email' : 'Email'}
          value={email}
          onChange={onEmailChange}
          required
        />
      </div>
      
      <div className="input-group">
        <FaLock className="icon-left" />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={locale === 'id' ? 'Kata Sandi' : 'Password'}
          value={password}
          onChange={onPasswordChange}
          required
        />
        <button
          type="button"
          className="toggle-pw"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="auth-meta-row">
        <label className="auth-check">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>{locale === 'id' ? 'Ingat saya' : 'Remember me'}</span>
        </label>

        <button type="button" className="auth-link-button">
          {locale === 'id' ? 'Lupa sandi?' : 'Forgot password?'}
        </button>
      </div>

      <div className="demo-credentials" style={{ marginBottom: '16px', padding: '12px 14px', border: '1px dashed var(--border)', borderRadius: '12px', background: 'var(--accent-dim)', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {locale === 'id' ? 'Akun Demo' : 'Demo Account'}
        </div>
        <div>Email: {DEMO_EMAIL}</div>
        <div>Password: {DEMO_PASSWORD}</div>
        <button type="button" className="auth-link-button" onClick={fillDemoAccount} style={{ marginTop: '8px', padding: 0 }}>
          {locale === 'id' ? 'Isi otomatis' : 'Autofill'}
        </button>
      </div>
      
      <button type="submit" className="btn-primary">
        {locale === 'id' ? 'Masuk' : 'Login'}
      </button>
    </form>
  );
}

export default LoginInput;